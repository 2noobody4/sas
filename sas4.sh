#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Fix — Clôture d'exercice bloquante + suivi des paiements sur
# factures + unicité de factures.numero (type, numero).
#
# Ce script ne touche QUE le code TypeScript (via python3, patchs
# exacts et idempotents). La partie base de données doit être
# appliquée séparément, à la main, dans Supabase → SQL Editor :
# le fichier sql/migration_cloture_et_paiements_factures.sql est
# créé par ce script mais N'EST PAS exécuté automatiquement (pas
# d'accès direct à ta base Supabase depuis ce script).
#
# NON traité ici (changements de schéma plus structurants, à
# planifier à part si besoin) :
#   🟡 Comptes auxiliaires par tiers (sous-comptes 401xxx/411xxx)
#   🟡 Écritures multi-lignes (transactions_comptables est limité
#      à un débit + un crédit uniques par ligne)
#
# À lancer depuis la racine du projet (là où se trouve package.json)
# ============================================================
set -e

if [ ! -f "package.json" ]; then
  echo "❌ Lance ce script depuis la racine du projet (package.json introuvable ici)."
  exit 1
fi

mkdir -p sql

echo "→ Sauvegarde des fichiers TypeScript modifiés (.bak)"
for f in src/types/comptabilite.ts src/types/facture.ts src/types/caisse.ts src/hooks/usePaiements.ts; do
  cp "$f" "$f.bak"
done

# ------------------------------------------------------------
# 1. Fichier SQL de migration (à exécuter à la main dans Supabase)
# ------------------------------------------------------------
echo "→ Écriture de sql/migration_cloture_et_paiements_factures.sql"
cat > sql/migration_cloture_et_paiements_factures.sql << 'SQLEOF'
-- ============================================================
-- Migration : clôture d'exercice bloquante + suivi des paiements
-- sur factures + unicité de factures.numero
-- À exécuter dans Supabase → SQL Editor (idempotent, relançable).
-- ============================================================

-- ------------------------------------------------------------
-- 1. 🔴 CLÔTURE D'EXERCICE BLOQUANTE
-- ------------------------------------------------------------
ALTER TABLE transactions_comptables
  ADD COLUMN IF NOT EXISTS exercice_id uuid REFERENCES exercices(id);

CREATE INDEX IF NOT EXISTS idx_transactions_comptables_exercice_id
  ON transactions_comptables(exercice_id);

UPDATE transactions_comptables t
SET exercice_id = e.id
FROM exercices e
WHERE t.exercice_id IS NULL
  AND t.date_transaction::date BETWEEN e.date_debut AND e.date_fin;

CREATE OR REPLACE FUNCTION fn_check_exercice_ouvert()
RETURNS TRIGGER AS $$
DECLARE
  v_new_exercice RECORD;
  v_old_exercice RECORD;
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT * INTO v_new_exercice
    FROM exercices
    WHERE NEW.date_transaction::date BETWEEN date_debut AND date_fin
    ORDER BY date_debut DESC
    LIMIT 1;

    IF FOUND AND v_new_exercice.cloture THEN
      RAISE EXCEPTION 'Exercice "%" clôturé : impossible d''enregistrer une écriture datée du %.',
        v_new_exercice.nom, NEW.date_transaction::date
        USING ERRCODE = '23514';
    END IF;

    NEW.exercice_id := v_new_exercice.id;
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT * INTO v_old_exercice
    FROM exercices
    WHERE OLD.date_transaction::date BETWEEN date_debut AND date_fin
    ORDER BY date_debut DESC
    LIMIT 1;

    IF FOUND AND v_old_exercice.cloture THEN
      RAISE EXCEPTION 'Exercice "%" clôturé : impossible de modifier ou supprimer cette écriture (%).',
        v_old_exercice.nom, OLD.date_transaction::date
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_exercice_ouvert ON transactions_comptables;
CREATE TRIGGER trg_check_exercice_ouvert
BEFORE INSERT OR UPDATE OR DELETE ON transactions_comptables
FOR EACH ROW EXECUTE FUNCTION fn_check_exercice_ouvert();

-- ------------------------------------------------------------
-- 2. 🔴 SUIVI DES PAIEMENTS SUR FACTURES
-- ------------------------------------------------------------
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS facture_id uuid REFERENCES factures(id) ON DELETE CASCADE;
ALTER TABLE paiements ALTER COLUMN vente_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paiements_source_unique') THEN
    ALTER TABLE paiements ADD CONSTRAINT paiements_source_unique CHECK (
      (vente_id IS NOT NULL AND facture_id IS NULL) OR
      (vente_id IS NULL AND facture_id IS NOT NULL)
    );
  END IF;
END $$;

ALTER TABLE factures ADD COLUMN IF NOT EXISTS montant_regle numeric NOT NULL DEFAULT 0;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS montant_restant numeric GENERATED ALWAYS AS (montant_ttc - montant_regle) STORED;

CREATE OR REPLACE FUNCTION fn_recalculer_montant_regle_facture(p_facture_id uuid)
RETURNS void AS $$
DECLARE
  v_total numeric;
  v_facture RECORD;
  v_nouveau_statut text;
BEGIN
  IF p_facture_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(montant), 0) INTO v_total FROM paiements WHERE facture_id = p_facture_id;
  SELECT * INTO v_facture FROM factures WHERE id = p_facture_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_facture.statut = 'brouillon' THEN
    v_nouveau_statut := v_facture.statut;
  ELSIF v_facture.montant_ttc > 0 AND v_total >= v_facture.montant_ttc THEN
    v_nouveau_statut := 'payee';
  ELSIF v_facture.date_echeance IS NOT NULL AND v_facture.date_echeance < CURRENT_DATE THEN
    v_nouveau_statut := 'en_retard';
  ELSE
    v_nouveau_statut := 'envoyee';
  END IF;

  UPDATE factures
  SET montant_regle = v_total,
      statut = v_nouveau_statut,
      updated_at = now()
  WHERE id = p_facture_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_trg_paiement_facture()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM fn_recalculer_montant_regle_facture(OLD.facture_id);
    RETURN OLD;
  END IF;

  PERFORM fn_recalculer_montant_regle_facture(NEW.facture_id);
  IF TG_OP = 'UPDATE' AND OLD.facture_id IS DISTINCT FROM NEW.facture_id THEN
    PERFORM fn_recalculer_montant_regle_facture(OLD.facture_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_paiement_facture ON paiements;
CREATE TRIGGER trg_paiement_facture
AFTER INSERT OR UPDATE OR DELETE ON paiements
FOR EACH ROW EXECUTE FUNCTION fn_trg_paiement_facture();

UPDATE factures SET montant_regle = montant_ttc WHERE statut = 'payee' AND montant_regle = 0;

-- ------------------------------------------------------------
-- 3. 🟡 UNICITÉ DE factures.numero (par type émise/reçue)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT type, numero FROM factures GROUP BY type, numero HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Doublons détectés sur (type, numero) dans factures : contrainte NON appliquée. Corrige les doublons puis relance ce script.';
  ELSIF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'factures_type_numero_unique') THEN
    ALTER TABLE factures ADD CONSTRAINT factures_type_numero_unique UNIQUE (type, numero);
  END IF;
END $$;
SQLEOF

# ------------------------------------------------------------
# 2. Réécriture de src/hooks/usePaiements.ts (paiements sur factures)
# ------------------------------------------------------------
echo "→ Réécriture de src/hooks/usePaiements.ts"
cat > src/hooks/usePaiements.ts << 'EOF'
import { useQuery, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Paiement, PaiementFormData } from '../types/caisse';
import { useToast } from './useToast';
import { logAction } from './useHistorique';
import { useOfflineMutation } from './useOfflineMutation';

export const usePaiements = (venteId?: string) => {
  return useQuery<Paiement[], Error>({
    queryKey: ['paiements', venteId],
    queryFn: async () => {
      let query = supabase.from('paiements').select('*').order('date_paiement', { ascending: false });
      if (venteId) query = query.eq('vente_id', venteId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Paiement[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// 🔧 Historique des règlements d'une facture (paiements partiels inclus) —
// corrige l'absence totale de suivi des paiements sur les factures :
// avant, seul un champ `statut` texte libre existait, sans historique ni
// montant réglé / restant dû.
export const usePaiementsFacture = (factureId?: string) => {
  return useQuery<Paiement[], Error>({
    queryKey: ['paiements_facture', factureId],
    queryFn: async () => {
      if (!factureId) return [];
      const { data, error } = await supabase
        .from('paiements')
        .select('*')
        .eq('facture_id', factureId)
        .order('date_paiement', { ascending: false });
      if (error) throw error;
      return data as Paiement[];
    },
    enabled: !!factureId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreatePaiement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // 🔧 venteId OU factureId (jamais les deux). Le contrôle serveur
  // (contrainte CHECK paiements_source_unique) reste la garantie ultime ;
  // ceci ne fait que donner un message d'erreur plus clair côté client.
  const mutationFn = async ({
    venteId,
    factureId,
    paiement,
  }: {
    venteId?: string;
    factureId?: string;
    paiement: PaiementFormData;
  }): Promise<Paiement> => {
    if (!venteId && !factureId) throw new Error('Un paiement doit être rattaché à une vente ou à une facture');
    if (venteId && factureId) throw new Error('Un paiement ne peut pas être rattaché à la fois à une vente et à une facture');

    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase
      .from('paiements')
      .insert([{
        vente_id: venteId || null,
        facture_id: factureId || null,
        moyen: paiement.moyen,
        montant: paiement.montant,
        reference: paiement.reference || null,
      }])
      .select()
      .single();
    if (error) throw error;
    if (userId) {
      try {
        await logAction(userId, factureId ? 'comptabilite' : 'caisse', 'create', 'paiement', inserted.id, null, inserted);
      } catch (e) {}
    }
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries('paiements');
        if (variables.factureId) {
          // Le trigger SQL a déjà recalculé montant_regle/statut côté
          // serveur ; on invalide juste le cache client pour le refléter.
          queryClient.invalidateQueries({ queryKey: ['paiements_facture', variables.factureId] });
          queryClient.invalidateQueries({ queryKey: ['factures'] });
        }
        success('Paiement enregistré ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/paiements',
    'POST'
  );
};

export const useDeletePaiement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { data: paiement } = await supabase.from('paiements').select('*').eq('id', id).single();
    const { error } = await supabase.from('paiements').delete().eq('id', id);
    if (error) throw error;
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId && paiement) {
      try {
        await logAction(userId, paiement.facture_id ? 'comptabilite' : 'caisse', 'delete', 'paiement', id, paiement, null);
      } catch (e) {}
    }
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries('paiements');
        queryClient.invalidateQueries({ queryKey: ['paiements_facture'] });
        queryClient.invalidateQueries({ queryKey: ['factures'] });
        success('Paiement supprimé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/paiements',
    'DELETE'
  );
};
EOF

# ------------------------------------------------------------
# 3. Patchs de types (comptabilite.ts, facture.ts, caisse.ts)
# ------------------------------------------------------------
echo "→ Application des patchs de types (via python3)"
python3 << 'PYEOF'
import sys

def patch(path, replacements, label):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new, name in replacements:
        if new in content:
            print(f"  • [{label}] {name} déjà appliqué, on saute.")
            continue
        if old not in content:
            print(f"  ❌ [{label}] bloc '{name}' introuvable tel quel — vérifie {path} manuellement.")
            sys.exit(1)
        content = content.replace(old, new, 1)
        print(f"  • [{label}] {name} patché.")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# ============================================================
# types/comptabilite.ts : exercice_id sur TransactionComptable
# ============================================================
patch(
    "src/types/comptabilite.ts",
    [
        (
            "  user?: User;\n  magasin_id?: string;\n  created_at: string;\n}\n\nexport interface TransactionFormData {",
            "  user?: User;\n  magasin_id?: string;\n  exercice_id?: string; // 🔧 Rempli automatiquement par un trigger SQL selon la date ; bloque l'écriture si l'exercice est clôturé (voir sql/migration_cloture_et_paiements_factures.sql)\n  created_at: string;\n}\n\nexport interface TransactionFormData {",
            "exercice_id sur TransactionComptable",
        ),
    ],
    "comptabilite.ts",
)

# ============================================================
# types/facture.ts : montant_regle / montant_restant
# ============================================================
patch(
    "src/types/facture.ts",
    [
        (
            "  rappel_envoye: boolean;\n  user_id: string;\n  transaction_id?: string; // 🔥 Lien vers transactions_comptables",
            "  rappel_envoye: boolean;\n  montant_regle: number; // 🔧 Somme des paiements liés (maintenue par trigger SQL)\n  montant_restant: number; // 🔧 Colonne générée : montant_ttc - montant_regle\n  user_id: string;\n  transaction_id?: string; // 🔥 Lien vers transactions_comptables",
            "montant_regle/montant_restant sur Facture",
        ),
    ],
    "facture.ts",
)

# ============================================================
# types/caisse.ts : Paiement / PaiementFormData -> facture_id
# ============================================================
patch(
    "src/types/caisse.ts",
    [
        (
            "export interface Paiement {\n  id: string;\n  vente_id: string;\n  moyen: MoyenPaiement;\n  montant: number;\n  reference?: string;\n  date_paiement: string;\n}",
            "export interface Paiement {\n  id: string;\n  vente_id?: string; // 🔧 optionnel : un paiement est lié soit à une vente, soit à une facture\n  facture_id?: string; // 🔧 Nouveau : paiement (éventuellement partiel) rattaché à une facture\n  moyen: MoyenPaiement;\n  montant: number;\n  reference?: string;\n  date_paiement: string;\n}",
            "facture_id sur Paiement",
        ),
    ],
    "caisse.ts",
)

print("✅ Tous les patchs de types appliqués.")
PYEOF

echo ""
echo "============================================================"
echo "✅ Code TypeScript patché."
echo ""
echo "⚠️  ÉTAPE MANUELLE OBLIGATOIRE (rien n'est appliqué en base) :"
echo "   1. Ouvre Supabase → SQL Editor"
echo "   2. Colle et exécute le contenu de :"
echo "      sql/migration_cloture_et_paiements_factures.sql"
echo "   3. Si la contrainte d'unicité (§3) affiche une NOTICE sur des"
echo "      doublons, corrige-les puis relance juste ce bloc SQL."
echo ""
echo "Non traité dans ce script (changements plus structurants) :"
echo "  🟡 Comptes auxiliaires par tiers (sous-comptes 401xxx/411xxx)"
echo "  🟡 Écritures multi-lignes (débit/crédit unique par transaction)"
echo "============================================================"
