#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Fix — Comptes auxiliaires par tiers (sous-comptes 401xxx pour
# les fournisseurs, 411xxx pour les clients), rattachés au compte
# collectif via `comptes.parent_id` (déjà présent, inutilisé jusqu'ici).
#
# Comme pour sas4.sh : ce script ne touche QUE le code TypeScript.
# La partie SQL (fonction get_or_create_compte_auxiliaire + colonnes
# tiers_type/tiers_id) doit être collée à la main dans Supabase →
# SQL Editor : sql/migration_comptes_auxiliaires.sql.
#
# Portée : seules les NOUVELLES factures créées après ce patch sont
# routées vers le sous-compte de leur tiers. Les écritures déjà
# postées sur le compte collectif ne sont pas rejouées (voir note en
# fin de fichier SQL).
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
for f in src/types/comptabilite.ts src/types/facture.ts src/components/BeneficiaireSelect.tsx src/pages/FactureFormPage.tsx src/hooks/useFactures.ts; do
  cp "$f" "$f.bak"
done

# ------------------------------------------------------------
# 1. Fichier SQL (à exécuter à la main dans Supabase)
# ------------------------------------------------------------
echo "→ Écriture de sql/migration_comptes_auxiliaires.sql"
cat > sql/migration_comptes_auxiliaires.sql << 'SQLEOF'
-- ============================================================
-- Migration : comptes auxiliaires par tiers (401xxx / 411xxx)
-- À exécuter dans Supabase → SQL Editor (idempotent, relançable).
-- ============================================================

ALTER TABLE comptes ADD COLUMN IF NOT EXISTS tiers_type text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comptes_tiers_type_check') THEN
    ALTER TABLE comptes ADD CONSTRAINT comptes_tiers_type_check CHECK (tiers_type IN ('client', 'fournisseur'));
  END IF;
END $$;
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS tiers_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_comptes_tiers_unique
  ON comptes(tiers_type, tiers_id) WHERE tiers_id IS NOT NULL;

CREATE OR REPLACE FUNCTION get_or_create_compte_auxiliaire(
  p_tiers_type text,
  p_tiers_id uuid,
  p_tiers_nom text
) RETURNS uuid AS $$
DECLARE
  v_compte_id uuid;
  v_parent RECORD;
  v_next_suffixe int;
  v_new_numero text;
BEGIN
  IF p_tiers_type NOT IN ('client', 'fournisseur') THEN
    RAISE EXCEPTION 'tiers_type invalide (attendu client ou fournisseur) : %', p_tiers_type;
  END IF;
  IF p_tiers_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_compte_id
  FROM comptes
  WHERE tiers_type = p_tiers_type AND tiers_id = p_tiers_id
  LIMIT 1;

  IF FOUND THEN
    RETURN v_compte_id;
  END IF;

  SELECT * INTO v_parent
  FROM comptes
  WHERE numero = (CASE WHEN p_tiers_type = 'client' THEN '411000' ELSE '401000' END)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compte collectif % introuvable — initialise le plan comptable avant de créer des sous-comptes.',
      (CASE WHEN p_tiers_type = 'client' THEN '411000' ELSE '401000' END);
  END IF;

  SELECT COALESCE(MAX(CAST(RIGHT(numero, 3) AS int)), 0) + 1 INTO v_next_suffixe
  FROM comptes
  WHERE parent_id = v_parent.id
    AND numero ~ ('^' || LEFT(v_parent.numero, 3) || '[0-9]{3}$');

  IF v_next_suffixe > 999 THEN
    RAISE EXCEPTION 'Plus de 999 sous-comptes sous % — numérotation à revoir.', v_parent.numero;
  END IF;

  v_new_numero := LEFT(v_parent.numero, 3) || LPAD(v_next_suffixe::text, 3, '0');

  INSERT INTO comptes (numero, nom, type, parent_id, niveau, solde, actif, tiers_type, tiers_id)
  VALUES (v_new_numero, COALESCE(p_tiers_nom, 'Tiers'), v_parent.type, v_parent.id, v_parent.niveau + 1, 0, true, p_tiers_type, p_tiers_id)
  RETURNING id INTO v_compte_id;

  RETURN v_compte_id;
END;
$$ LANGUAGE plpgsql;

-- Note de portée : les factures déjà comptabilisées sur le compte
-- collectif ne sont pas rejouées vers un sous-compte automatiquement.
SQLEOF

# ------------------------------------------------------------
# 2. Patchs TypeScript (via python3)
# ------------------------------------------------------------
echo "→ Application des patchs TypeScript (via python3)"
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
# types/comptabilite.ts : tiers_type / tiers_id sur Compte
# ============================================================
patch(
    "src/types/comptabilite.ts",
    [
        (
            "export interface Compte {\n  id: string;\n  numero: string;\n  nom: string;\n  type: TypeCompte;\n  parent_id?: string;\n  parent?: Compte;\n  niveau: number;\n  solde: number;\n  user_id?: string;\n  actif: boolean;\n  created_at: string;\n  updated_at: string;\n}",
            "export interface Compte {\n  id: string;\n  numero: string;\n  nom: string;\n  type: TypeCompte;\n  parent_id?: string;\n  parent?: Compte;\n  niveau: number;\n  solde: number;\n  user_id?: string;\n  actif: boolean;\n  tiers_type?: 'client' | 'fournisseur'; // 🔧 Compte auxiliaire par tiers (401xxx/411xxx)\n  tiers_id?: string;\n  created_at: string;\n  updated_at: string;\n}",
            "tiers_type/tiers_id sur Compte",
        ),
    ],
    "comptabilite.ts",
)

# ============================================================
# types/facture.ts : fournisseur_client_id sur FactureFormData
# ============================================================
patch(
    "src/types/facture.ts",
    [
        (
            "  statut: FactureStatut;\n  fournisseur_client_nom?: string;\n  description?: string;\n  fichier_url?: string;\n  compte_debit_id?: string;\n  compte_credit_id?: string;\n}",
            "  statut: FactureStatut;\n  fournisseur_client_nom?: string;\n  fournisseur_client_id?: string; // 🔧 Permet de rattacher la facture au sous-compte auxiliaire du tiers\n  description?: string;\n  fichier_url?: string;\n  compte_debit_id?: string;\n  compte_credit_id?: string;\n}",
            "fournisseur_client_id sur FactureFormData",
        ),
    ],
    "facture.ts",
)

# ============================================================
# components/BeneficiaireSelect.tsx : ajout des clients à la liste
# ============================================================
patch(
    "src/components/BeneficiaireSelect.tsx",
    [
        (
            "import { useFournisseurs } from '../hooks/useFournisseurs';\nimport { useAuth } from '../hooks/useAuth';\nimport { Fournisseur } from '../types/stock';",
            "import { useFournisseurs } from '../hooks/useFournisseurs';\nimport { useClients } from '../hooks/useClients';\nimport { useAuth } from '../hooks/useAuth';\nimport { Fournisseur } from '../types/stock';\nimport { Client } from '../types/clients';",
            "import useClients",
        ),
        (
            "  const { data: fournisseurs = [] } = useFournisseurs();\n  const { user } = useAuth();",
            "  const { data: fournisseurs = [] } = useFournisseurs();\n  const { data: clients = [] } = useClients(); // 🔧 comptes auxiliaires par tiers : une facture émise doit pouvoir référencer un vrai client\n  const { user } = useAuth();",
            "useClients()",
        ),
        (
            "    if (type === 'all' || type === 'fournisseur') {\n      fournisseurs.forEach((f: Fournisseur) => {\n        list.push({ nom: f.nom, id: f.id, type: 'fournisseur' });\n      });\n    }\n\n    if (type === 'all' || type === 'employe') {",
            "    if (type === 'all' || type === 'fournisseur') {\n      fournisseurs.forEach((f: Fournisseur) => {\n        list.push({ nom: f.nom, id: f.id, type: 'fournisseur' });\n      });\n    }\n\n    // 🔧 Comptes auxiliaires par tiers : sans ce bloc, une facture \"émise\"\n    // ne pouvait jamais être rattachée à un vrai client, donc jamais à\n    // son sous-compte 411xxx.\n    if (type === 'all' || type === 'client') {\n      clients.forEach((c: Client) => {\n        list.push({ nom: `${c.prenom || ''} ${c.nom}`.trim(), id: c.id, type: 'client' });\n      });\n    }\n\n    if (type === 'all' || type === 'employe') {",
            "liste des clients",
        ),
        (
            "  }, [fournisseurs, user, type]);",
            "  }, [fournisseurs, clients, user, type]);",
            "deps useMemo",
        ),
    ],
    "BeneficiaireSelect.tsx",
)

# ============================================================
# pages/FactureFormPage.tsx
# ============================================================
patch(
    "src/pages/FactureFormPage.tsx",
    [
        (
            "    fournisseur_client_nom: '',\n    description: '',\n    fichier_url: '',\n    compte_debit_id: '',\n    compte_credit_id: '',\n  });",
            "    fournisseur_client_nom: '',\n    fournisseur_client_id: '', // 🔧 comptes auxiliaires par tiers\n    description: '',\n    fichier_url: '',\n    compte_debit_id: '',\n    compte_credit_id: '',\n  });",
            "fournisseur_client_id dans le state initial",
        ),
        (
            "          fournisseur_client_nom: facture.fournisseur_client_nom || '',\n          description: facture.description || '',",
            "          fournisseur_client_nom: facture.fournisseur_client_nom || '',\n          fournisseur_client_id: (facture as any).fournisseur_client_id || '', // 🔧 comptes auxiliaires par tiers\n          description: facture.description || '',",
            "fournisseur_client_id au chargement en édition",
        ),
        (
            "  const handleBeneficiaireChange = (nom: string, id?: string) => {\n    setForm(prev => ({ ...prev, fournisseur_client_nom: nom }));\n  };",
            "  const handleBeneficiaireChange = (nom: string, id?: string) => {\n    // 🔧 comptes auxiliaires par tiers : on garde l'id du tiers sélectionné\n    // pour le rattacher à son sous-compte 401xxx/411xxx à la création de\n    // la facture (voir useCreateFacture).\n    setForm(prev => ({ ...prev, fournisseur_client_nom: nom, fournisseur_client_id: id || '' }));\n  };",
            "handleBeneficiaireChange garde l'id",
        ),
        (
            "                type={form.type === 'recue' ? 'fournisseur' : 'all'}",
            "                type={form.type === 'recue' ? 'fournisseur' : 'client'}",
            "BeneficiaireSelect filtré par vrai type de tiers",
        ),
    ],
    "FactureFormPage.tsx",
)

# ============================================================
# hooks/useFactures.ts : résolution du compte auxiliaire à la création
# ============================================================
patch(
    "src/hooks/useFactures.ts",
    [
        (
            """  const mutationFn = async (data: FactureFormData): Promise<Facture> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    // 1. Créer la facture
    const { data: inserted, error } = await supabase
      .from('factures')
      .insert([{ 
        ...data, 
        user_id: userId,
        rappel_envoye: false,
      }])
      .select()
      .single();
    
    if (error) throw error;

    // 2. 🔥 COMPTABILISATION
    try {
      let compteDebitId = (data as any).compte_debit_id;
      let compteCreditId = (data as any).compte_credit_id;

      if (!compteDebitId || !compteCreditId) {
        // Récupérer les comptes par défaut
        const { data: comptes } = await supabase
          .from('comptes')
          .select('id, numero')
          .in('numero', ['411000', '401000', '701000']);

        if (data.type === 'emise') {
          // Facture client : Débit Client, Crédit Vente
          const compteClient = comptes?.find((c: any) => c.numero === '411000');
          const compteVente = comptes?.find((c: any) => c.numero === '701000');
          if (compteClient) compteDebitId = compteClient.id;
          if (compteVente) compteCreditId = compteVente.id;
        } else {
          // Facture fournisseur : Débit Charge, Crédit Fournisseur
          const compteCharge = comptes?.find((c: any) => c.numero === '611000');
          const compteFournisseur = comptes?.find((c: any) => c.numero === '401000');
          if (compteCharge) compteDebitId = compteCharge.id;
          if (compteFournisseur) compteCreditId = compteFournisseur.id;
        }
      }

      if (compteDebitId && compteCreditId) {
        await comptabiliserFacture.mutateAsync({
          factureId: inserted.id,
          montant: data.montant_ttc,
          compteDebitId,
          compteCreditId,
          type: data.type,
          libelle: `N°${data.numero} - ${data.fournisseur_client_nom || 'Sans bénéficiaire'}`,
          userId: userId,
        });
      }
    } catch (comptaError) {
      console.error('[useCreateFacture] Erreur comptabilisation:', comptaError);
    }

    return inserted;
  };""",
            """  const mutationFn = async (data: FactureFormData): Promise<Facture> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    // 1. Résoudre les comptes débit/crédit AVANT de créer la facture, pour
    // que factures.compte_debit_id/compte_credit_id reflète exactement les
    // comptes utilisés par l'écriture comptable (§3).
    let compteDebitId = (data as any).compte_debit_id;
    let compteCreditId = (data as any).compte_credit_id;

    const { data: comptesParDefaut } = await supabase
      .from('comptes')
      .select('id, numero')
      .in('numero', ['411000', '401000', '701000', '611000']);

    const compteClientCollectif = comptesParDefaut?.find((c: any) => c.numero === '411000');
    const compteFournisseurCollectif = comptesParDefaut?.find((c: any) => c.numero === '401000');

    if (!compteDebitId || !compteCreditId) {
      if (data.type === 'emise') {
        // Facture client : Débit Client, Crédit Vente
        const compteVente = comptesParDefaut?.find((c: any) => c.numero === '701000');
        if (compteClientCollectif) compteDebitId = compteDebitId || compteClientCollectif.id;
        if (compteVente) compteCreditId = compteCreditId || compteVente.id;
      } else {
        // Facture fournisseur : Débit Charge, Crédit Fournisseur
        const compteCharge = comptesParDefaut?.find((c: any) => c.numero === '611000');
        if (compteCharge) compteDebitId = compteDebitId || compteCharge.id;
        if (compteFournisseurCollectif) compteCreditId = compteCreditId || compteFournisseurCollectif.id;
      }
    }

    // 2. 🔧 Comptes auxiliaires par tiers : si un tiers précis est
    // sélectionné, on route l'écriture vers son sous-compte 411xxx/401xxx
    // plutôt que vers le compte collectif générique — corrige la
    // déconnexion entre le solde "je dois à X" (recalculé en sommant les
    // factures) et le grand livre. On ne remplace que si le compte est
    // encore le compte collectif par défaut : un choix manuel de
    // l'utilisateur dans le formulaire reste prioritaire.
    if ((data as any).fournisseur_client_id) {
      try {
        const tiersType = data.type === 'emise' ? 'client' : 'fournisseur';
        const { data: compteAuxId, error: auxError } = await supabase.rpc('get_or_create_compte_auxiliaire', {
          p_tiers_type: tiersType,
          p_tiers_id: (data as any).fournisseur_client_id,
          p_tiers_nom: data.fournisseur_client_nom || 'Tiers',
        });
        if (auxError) throw auxError;
        if (compteAuxId) {
          if (data.type === 'emise' && (!compteDebitId || compteDebitId === compteClientCollectif?.id)) {
            compteDebitId = compteAuxId;
          }
          if (data.type === 'recue' && (!compteCreditId || compteCreditId === compteFournisseurCollectif?.id)) {
            compteCreditId = compteAuxId;
          }
        }
      } catch (auxError) {
        console.error('[useCreateFacture] Erreur compte auxiliaire tiers:', auxError);
      }
    }

    // 3. Créer la facture avec les comptes déjà résolus
    const { data: inserted, error } = await supabase
      .from('factures')
      .insert([{
        ...data,
        compte_debit_id: compteDebitId,
        compte_credit_id: compteCreditId,
        user_id: userId,
        rappel_envoye: false,
      }])
      .select()
      .single();

    if (error) throw error;

    // 4. 🔥 COMPTABILISATION
    try {
      if (compteDebitId && compteCreditId) {
        await comptabiliserFacture.mutateAsync({
          factureId: inserted.id,
          montant: data.montant_ttc,
          compteDebitId,
          compteCreditId,
          type: data.type,
          libelle: `N°${data.numero} - ${data.fournisseur_client_nom || 'Sans bénéficiaire'}`,
          userId: userId,
        });
      }
    } catch (comptaError) {
      console.error('[useCreateFacture] Erreur comptabilisation:', comptaError);
    }

    return inserted;
  };""",
            "résolution compte auxiliaire avant création facture",
        ),
    ],
    "useFactures.ts",
)

print("✅ Tous les patchs TypeScript appliqués.")
PYEOF

echo ""
echo "============================================================"
echo "✅ Code TypeScript patché."
echo ""
echo "⚠️  ÉTAPE MANUELLE OBLIGATOIRE (rien n'est appliqué en base) :"
echo "   Ouvre Supabase → SQL Editor et exécute :"
echo "      sql/migration_comptes_auxiliaires.sql"
echo ""
echo "Effet côté app : à la sélection d'un client (facture émise) ou"
echo "d'un fournisseur (facture reçue) dans le formulaire de facture,"
echo "un sous-compte 411xxx/401xxx est automatiquement créé (ou réutilisé)"
echo "pour ce tiers et devient le compte débit/crédit de l'écriture."
echo ""
echo "Non rejoué automatiquement : les factures déjà comptabilisées avant"
echo "ce patch restent sur le compte collectif (411000/401000)."
echo "============================================================"
