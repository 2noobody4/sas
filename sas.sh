#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Point 12 — Scoping multi-magasin sur les hooks de lecture
# comptabilité + charges + factures + sessions de caisse.
#
# Choix de compatibilité : un enregistrement avec magasin_id = NULL
# est traité comme "partagé" (visible depuis tous les magasins).
# Ça évite de casser un déploiement mono-magasin existant où
# magasin_id n'a jamais été renseigné. Une fois que tu auras
# backfillé magasin_id partout, tu pourras durcir en `.eq()` strict
# (chercher les commentaires "🔧 Point 12" dans le diff).
#
# NON traité ici : useVentes() (table `ventes` n'a pas de colonne
# magasin_id — le lien passe par session_id -> sessions_caisse.
# magasin_id, ça demande un filtre sur jointure, plus risqué à
# patcher à l'aveugle. À faire à part si besoin.)
#
# À lancer depuis la racine du projet (là où se trouve package.json)
# ============================================================
set -e

if [ ! -f "package.json" ]; then
  echo "❌ Lance ce script depuis la racine du projet (package.json introuvable ici)."
  exit 1
fi

for f in src/hooks/useComptabilite.ts src/hooks/useFactures.ts src/hooks/useChargesUsuelles.ts src/hooks/useSessions.ts; do
  echo "→ Sauvegarde de $f en $f.bak"
  cp "$f" "$f.bak"
done

echo "→ Application des patchs (via python3)"
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
# useComptabilite.ts
# ============================================================
patch(
    "src/hooks/useComptabilite.ts",
    [
        (
            "import { useDataLoader } from '../contexts/DataLoaderContext';",
            "import { useDataLoader } from '../contexts/DataLoaderContext';\n"
            "import { useMagasinActif } from '../contexts/MagasinActifContext';",
            "import useMagasinActif",
        ),
        (
            """let _comptesMapCache: { at: number; map: Map<string, Compte> } | null = null;

const fetchComptesMap = async (): Promise<Map<string, Compte>> => {
  // Petit cache mémoire (5s) pour éviter de re-fetcher tous les comptes à
  // chaque ligne/transaction affichée dans la même fenêtre de rendu.
  if (_comptesMapCache && Date.now() - _comptesMapCache.at < 5000) {
    return _comptesMapCache.map;
  }
  const { data, error } = await supabase.from('comptes').select('*');
  if (error) {
    console.error('[fetchComptesMap] Erreur Supabase:', error);
    throw error;
  }
  const map = new Map<string, Compte>((data || []).map((c: Compte) => [c.id, c]));
  _comptesMapCache = { at: Date.now(), map };
  return map;
};""",
            """let _comptesMapCache: { at: number; magasinId: string | null; map: Map<string, Compte> } | null = null;

// 🔧 Point 12 : scopé par magasin actif. magasin_id = null = compte
// "partagé" (compat. avec les données existantes sans magasin_id).
const fetchComptesMap = async (magasinId: string | null = null): Promise<Map<string, Compte>> => {
  // Petit cache mémoire (5s) pour éviter de re-fetcher tous les comptes à
  // chaque ligne/transaction affichée dans la même fenêtre de rendu.
  if (_comptesMapCache && _comptesMapCache.magasinId === magasinId && Date.now() - _comptesMapCache.at < 5000) {
    return _comptesMapCache.map;
  }
  let query = supabase.from('comptes').select('*');
  if (magasinId) {
    query = query.or(`magasin_id.eq.${magasinId},magasin_id.is.null`);
  }
  const { data, error } = await query;
  if (error) {
    console.error('[fetchComptesMap] Erreur Supabase:', error);
    throw error;
  }
  const map = new Map<string, Compte>((data || []).map((c: Compte) => [c.id, c]));
  _comptesMapCache = { at: Date.now(), magasinId, map };
  return map;
};""",
            "fetchComptesMap",
        ),
        (
            """export const useComptes = (actif?: boolean) => {
  const { getData } = useDataLoader();
  return useQuery<Compte[], Error>({
    queryKey: ['comptes', actif],
    queryFn: async () => {
      try {
        let query = supabase
          .from('comptes')
          .select('*')
          .order('numero');

        if (actif !== undefined) {
          query = query.eq('actif', actif);
        }

        const { data, error } = await query;""",
            """export const useComptes = (actif?: boolean) => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<Compte[], Error>({
    // 🔧 Point 12 : magasinActifId dans la clé -> refetch au changement de magasin.
    queryKey: ['comptes', actif, magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('comptes')
          .select('*')
          .order('numero');

        if (actif !== undefined) {
          query = query.eq('actif', actif);
        }
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }

        const { data, error } = await query;""",
            "useComptes",
        ),
        (
            """  const { getData } = useDataLoader();
  return useQuery<TransactionComptable[], Error>({
    queryKey: ['transactions_comptables', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('transactions_comptables')
          .select('*')
          .order('date_transaction', { ascending: false });

        if (filters?.date_debut) query = query.gte('date_transaction', filters.date_debut);
        if (filters?.date_fin) query = query.lte('date_transaction', finDeJournee(filters.date_fin));
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.compte_id) {
          query = query.or(`compte_debit_id.eq.${filters.compte_id},compte_credit_id.eq.${filters.compte_id}`);
        }
        if (filters?.magasin_id) query = query.eq('magasin_id', filters.magasin_id);

        const [{ data, error }, comptesMap] = await Promise.all([query, fetchComptesMap()]);""",
            """  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  // 🔧 Point 12 : si l'appelant ne précise pas magasin_id explicitement,
  // on scope par défaut sur le magasin actif plutôt que de tout charger.
  const magasinId = filters?.magasin_id ?? magasinActifId;
  return useQuery<TransactionComptable[], Error>({
    queryKey: ['transactions_comptables', filters, magasinId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('transactions_comptables')
          .select('*')
          .order('date_transaction', { ascending: false });

        if (filters?.date_debut) query = query.gte('date_transaction', filters.date_debut);
        if (filters?.date_fin) query = query.lte('date_transaction', finDeJournee(filters.date_fin));
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.compte_id) {
          query = query.or(`compte_debit_id.eq.${filters.compte_id},compte_credit_id.eq.${filters.compte_id}`);
        }
        if (magasinId) query = query.or(`magasin_id.eq.${magasinId},magasin_id.is.null`);

        const [{ data, error }, comptesMap] = await Promise.all([query, fetchComptesMap(magasinId ?? null)]);""",
            "useTransactions",
        ),
        (
            """export const useSaisies = (filters?: { type?: string; statut?: string }) => {
  const { getData } = useDataLoader();
  return useQuery<SaisieComptable[], Error>({
    queryKey: ['saisies_comptables', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('saisies_comptables')
          .select('*')
          .order('date_operation', { ascending: false });

        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.statut) query = query.eq('statut_paiement', filters.statut);

        const { data, error } = await query;""",
            """export const useSaisies = (filters?: { type?: string; statut?: string }) => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<SaisieComptable[], Error>({
    queryKey: ['saisies_comptables', filters, magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('saisies_comptables')
          .select('*')
          .order('date_operation', { ascending: false });

        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.statut) query = query.eq('statut_paiement', filters.statut);
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }

        const { data, error } = await query;""",
            "useSaisies",
        ),
    ],
    "useComptabilite.ts",
)

# ============================================================
# useFactures.ts
# ============================================================
patch(
    "src/hooks/useFactures.ts",
    [
        (
            "import { annulerTransactionsParReference } from './useAnnulationTransaction';",
            "import { annulerTransactionsParReference } from './useAnnulationTransaction';\n"
            "import { useMagasinActif } from '../contexts/MagasinActifContext';",
            "import useMagasinActif",
        ),
        (
            """export const useFactures = (filters?: { type?: string; statut?: string }) => {
  const { getData } = useDataLoader();
  return useQuery<Facture[], Error>({
    queryKey: ['factures', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('factures').select('*').order('date_emission', { ascending: false });
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.statut) query = query.eq('statut', filters.statut);
        const { data, error } = await query;""",
            """export const useFactures = (filters?: { type?: string; statut?: string }) => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<Facture[], Error>({
    queryKey: ['factures', filters, magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase.from('factures').select('*').order('date_emission', { ascending: false });
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.statut) query = query.eq('statut', filters.statut);
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }
        const { data, error } = await query;""",
            "useFactures",
        ),
        (
            """export const useFacturesARegler = () => {
  return useQuery<Facture[], Error>({
    queryKey: ['factures_a_regler'],
    queryFn: async () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 26);
      const dateStr = nextMonth.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('factures')
        .select('*')
        .eq('type', 'recue')
        .in('statut', ['envoyee', 'en_retard'])
        .lte('date_echeance', dateStr)
        .order('date_echeance', { ascending: true });
      if (error) throw error;""",
            """export const useFacturesARegler = () => {
  const { magasinActifId } = useMagasinActif();
  return useQuery<Facture[], Error>({
    queryKey: ['factures_a_regler', magasinActifId],
    queryFn: async () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 26);
      const dateStr = nextMonth.toISOString().split('T')[0];
      let query = supabase
        .from('factures')
        .select('*')
        .eq('type', 'recue')
        .in('statut', ['envoyee', 'en_retard'])
        .lte('date_echeance', dateStr)
        .order('date_echeance', { ascending: true });
      // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
      if (magasinActifId) {
        query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
      }
      const { data, error } = await query;
      if (error) throw error;""",
            "useFacturesARegler",
        ),
    ],
    "useFactures.ts",
)

# ============================================================
# useChargesUsuelles.ts
# ============================================================
patch(
    "src/hooks/useChargesUsuelles.ts",
    [
        (
            "import { useDataLoader } from '../contexts/DataLoaderContext';",
            "import { useDataLoader } from '../contexts/DataLoaderContext';\n"
            "import { useMagasinActif } from '../contexts/MagasinActifContext';",
            "import useMagasinActif",
        ),
        (
            """export const useChargesUsuelles = () => {
  const { getData } = useDataLoader();
  return useQuery<ChargeUsuelle[], Error>({
    queryKey: ['charges_usuelles'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('charges_usuelles')
          .select('*')
          .eq('actif', true)
          .order('nom');
        if (error) throw error;""",
            """export const useChargesUsuelles = () => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<ChargeUsuelle[], Error>({
    queryKey: ['charges_usuelles', magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('charges_usuelles')
          .select('*')
          .eq('actif', true)
          .order('nom');
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }
        const { data, error } = await query;
        if (error) throw error;""",
            "useChargesUsuelles",
        ),
    ],
    "useChargesUsuelles.ts",
)

# ============================================================
# useSessions.ts
# ============================================================
patch(
    "src/hooks/useSessions.ts",
    [
        (
            "import { useOfflineMutation } from './useOfflineMutation';",
            "import { useOfflineMutation } from './useOfflineMutation';\n"
            "import { useMagasinActif } from '../contexts/MagasinActifContext';",
            "import useMagasinActif",
        ),
        (
            """export const useSessions = () => {
  const { getData } = useDataLoader();
  return useQuery<SessionCaisse[], Error>({
    queryKey: ['sessions_caisse'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('sessions_caisse')
          .select('*, user:users(id, nom, prenom, email)')
          .order('date_ouverture', { ascending: false });
        if (error) throw error;""",
            """export const useSessions = () => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<SessionCaisse[], Error>({
    queryKey: ['sessions_caisse', magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('sessions_caisse')
          .select('*, user:users(id, nom, prenom, email)')
          .order('date_ouverture', { ascending: false });
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }
        const { data, error } = await query;
        if (error) throw error;""",
            "useSessions",
        ),
    ],
    "useSessions.ts",
)

print("✅ Tous les patchs appliqués.")
PYEOF

echo ""
echo "============================================================"
echo "Terminé. Fichiers modifiés (backups en .bak à côté) :"
echo "  - src/hooks/useComptabilite.ts   (fetchComptesMap, useComptes,"
echo "                                     useTransactions, useSaisies)"
echo "  - src/hooks/useFactures.ts       (useFactures, useFacturesARegler)"
echo "  - src/hooks/useChargesUsuelles.ts (useChargesUsuelles)"
echo "  - src/hooks/useSessions.ts       (useSessions)"
echo ""
echo "PAS traité (à faire à part) :"
echo "  - useVentes() : table 'ventes' sans magasin_id direct, filtre"
echo "    à faire via jointure sur session_id -> sessions_caisse.magasin_id."
echo ""
echo "Vérifie avec :"
echo "  git diff src/hooks/"
echo "  npm run build   (ou ton script de type-check habituel)"
echo "============================================================"
