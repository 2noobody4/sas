/**
 * useComptabiliteRapports - Grand Livre, Etat de TVA, classification du Bilan
 * ------------------------------------------------------------
 * Compatible React 16.14 / react-query v3.
 *
 * Convention supposee pour `comptes.solde` (celle deja utilisee par
 * useBilan) : le solde est exprime dans le SENS NATUREL du compte
 * (actif/charge = debiteur positif, passif/produit = crediteur positif).
 * Un solde negatif signifie donc un solde du cote oppose.
 *
 * 🔧 Correction : le Grand Livre et l'État de TVA ne lisaient que
 * `transactions_comptables` (écritures à 2 comptes). Les écritures créées
 * via le moteur multi-lignes (`ecritures` / `ecritures_lignes`, exposées
 * par la vue `v_ecritures_detail`) n'apparaissaient nulle part dans le
 * détail, alors que les soldes globaux des comptes, eux, étaient déjà à
 * jour (mis à jour par `update_compte_solde` dans les deux moteurs). Les
 * deux sources sont maintenant fusionnées.
 */

import { useQuery } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Compte, BilanDetail, DetailTiers } from '../types/comptabilite';

// ============================================================
// OUTILS
// ============================================================

const jour = (d?: string | null): string => (d ? String(d).slice(0, 10) : '');

export const sensNaturel = (type: string): 'debit' | 'credit' =>
  type === 'actif' || type === 'charge' ? 'debit' : 'credit';

// ============================================================
// BILAN - classification des comptes
// ============================================================

type Nature = 'creance' | 'dette';
type PosteTiers = keyof DetailTiers;

const detailVide = (): DetailTiers => ({
  clients: 0,
  fournisseurs: 0,
  personnel: 0,
  etat: 0,
  autres: 0,
});

/**
 * Nature "normale" d'un compte de tiers (classe 4) et poste de detail.
 * Le sens REEL est ensuite corrige d'apres le signe du solde
 * (ex : 401 avec solde debiteur => creance ; 409 avec solde crediteur => dette).
 */
function regleTiers(num: string, type: string): { nature: Nature; poste: PosteTiers } {
  if (num.startsWith('409')) return { nature: 'creance', poste: 'fournisseurs' }; // fournisseurs debiteurs
  if (num.startsWith('40')) return { nature: 'dette', poste: 'fournisseurs' };
  if (num.startsWith('419')) return { nature: 'dette', poste: 'clients' }; // avances recues
  if (num.startsWith('41')) return { nature: 'creance', poste: 'clients' };
  if (num.startsWith('42')) {
    // 421 / 425 = avances et acomptes verses au personnel => creance ; reste = dettes
    const avance = num.startsWith('421') || num.startsWith('425');
    return { nature: avance ? 'creance' : 'dette', poste: 'personnel' };
  }
  if (num.startsWith('43')) return { nature: 'dette', poste: 'etat' }; // organismes sociaux
  if (num.startsWith('44')) {
    // Etat : le type du compte decide (ex : TVA recuperable = actif, impots a payer = passif)
    return { nature: type === 'actif' ? 'creance' : 'dette', poste: 'etat' };
  }
  return { nature: type === 'actif' ? 'creance' : 'dette', poste: 'autres' };
}

export function calculerBilanDepuisComptes(comptes: Compte[]) {
  const actif = { immobilisations: 0, stocks: 0, creances: 0, tresorerie: 0 };
  const passif = { capitaux_propres: 0, dettes_financieres: 0, dettes_circulantes: 0 };
  const detail: BilanDetail = { creances: detailVide(), dettes: detailVide() };

  comptes.forEach((c: Compte) => {
    const num = c.numero || '';
    const solde = Number(c.solde) || 0;

    if (num.startsWith('2')) {
      actif.immobilisations += solde;
    } else if (num.startsWith('3')) {
      actif.stocks += solde;
    } else if (num.startsWith('4')) {
      const regle = regleTiers(num, c.type);
      let nature: Nature = regle.nature;
      let montant = solde;
      if (solde < 0) {
        nature = nature === 'creance' ? 'dette' : 'creance';
        montant = -solde;
      }
      if (montant === 0) return;
      if (nature === 'creance') {
        actif.creances += montant;
        detail.creances[regle.poste] += montant;
      } else {
        passif.dettes_circulantes += montant;
        detail.dettes[regle.poste] += montant;
      }
    } else if (num.startsWith('5')) {
      actif.tresorerie += solde;
    } else if (num.startsWith('16')) {
      // '16' (emprunts) AVANT '1' generique (capitaux propres)
      passif.dettes_financieres += solde;
    } else if (num.startsWith('1')) {
      passif.capitaux_propres += solde;
    }
  });

  return { actif, passif, detail };
}

// ============================================================
// GRAND LIVRE
// ============================================================

export interface LigneGrandLivre {
  id: string;
  date: string;
  libelle: string;
  reference?: string;
  type: string;
  contrepartie: string;
  debit: number;
  credit: number;
  solde: number; // solde courant, dans le sens naturel du compte
}

export interface GrandLivre {
  compte: Compte;
  sens: 'debit' | 'credit';
  soldeOuverture: number;
  lignes: LigneGrandLivre[];
  totalDebit: number;
  totalCredit: number;
  soldeFinal: number;
}

// Forme normalisee commune aux deux moteurs (transactions_comptables
// ET ecritures/ecritures_lignes), avant application du solde cumule.
interface MouvementBrut {
  id: string;
  date: string;
  libelle: string;
  reference?: string;
  type: string;
  contrepartie: string;
  debit: number;
  credit: number;
}

export const useGrandLivre = (compteId?: string, dateDebut?: string, dateFin?: string) =>
  useQuery<GrandLivre | null, Error>({
    queryKey: ['grand_livre', compteId, dateDebut, dateFin],
    enabled: !!compteId,
    queryFn: async () => {
      if (!compteId) return null;

      const [cpt, tous, mvts, lignesCompte] = await Promise.all([
        supabase.from('comptes').select('*').eq('id', compteId).single(),
        supabase.from('comptes').select('id, numero, nom'),
        supabase
          .from('transactions_comptables')
          .select('*')
          .or(`compte_debit_id.eq.${compteId},compte_credit_id.eq.${compteId}`)
          .order('date_transaction', { ascending: true })
          .order('created_at', { ascending: true }),
        // Écritures multi-lignes touchant ce compte (nouveau moteur)
        supabase
          .from('v_ecritures_detail')
          .select('*')
          .eq('compte_id', compteId)
          .order('date_ecriture', { ascending: true }),
      ]);

      if (cpt.error) throw new Error(cpt.error.message || 'Compte introuvable');
      if (tous.error) throw new Error(tous.error.message);
      if (mvts.error) throw new Error(mvts.error.message);
      if (lignesCompte.error) throw new Error(lignesCompte.error.message);

      const compte = cpt.data as Compte;
      const sens = sensNaturel(compte.type);
      const effet = (d: number, c: number) => (sens === 'debit' ? d - c : c - d);

      const noms = new Map<string, string>();
      (tous.data || []).forEach((c: any) => noms.set(c.id, `${c.numero} - ${c.nom}`));

      // --- Contrepartie des écritures multi-lignes : les AUTRES lignes
      // de la même écriture (une écriture peut toucher plus de 2 comptes).
      const ecritureIds = Array.from(
        new Set((lignesCompte.data || []).map((l: any) => l.ecriture_id))
      );
      const autresLignesParEcriture = new Map<string, string[]>();
      if (ecritureIds.length > 0) {
        const { data: toutesLignes, error: toutesLignesErr } = await supabase
          .from('v_ecritures_detail')
          .select('ecriture_id, compte_id, compte_numero, compte_nom')
          .in('ecriture_id', ecritureIds);
        if (toutesLignesErr) throw new Error(toutesLignesErr.message);
        (toutesLignes || []).forEach((l: any) => {
          if (l.compte_id === compteId) return; // exclut le compte courant
          const label = `${l.compte_numero} - ${l.compte_nom}`;
          const liste = autresLignesParEcriture.get(l.ecriture_id) || [];
          if (liste.indexOf(label) === -1) liste.push(label);
          autresLignesParEcriture.set(l.ecriture_id, liste);
        });
      }

      // --- Fusion des deux moteurs en une seule liste normalisee ---
      const brut: MouvementBrut[] = [];

      (mvts.data || []).forEach((t: any) => {
        const montant = Number(t.montant) || 0;
        const autreId = t.compte_debit_id === compteId ? t.compte_credit_id : t.compte_debit_id;
        brut.push({
          id: t.id,
          date: t.date_transaction,
          libelle: t.libelle,
          reference: t.reference || undefined,
          type: t.type,
          contrepartie: noms.get(autreId) || '',
          debit: t.compte_debit_id === compteId ? montant : 0,
          credit: t.compte_credit_id === compteId ? montant : 0,
        });
      });

      (lignesCompte.data || []).forEach((l: any) => {
        const montant = Number(l.montant) || 0;
        const contreparties = autresLignesParEcriture.get(l.ecriture_id) || [];
        brut.push({
          id: l.ligne_id,
          date: l.date_ecriture,
          libelle: l.libelle_ligne || l.libelle,
          reference: l.reference || undefined,
          type: l.type,
          contrepartie: contreparties.length > 0 ? contreparties.join(', ') : 'Écriture multi-lignes',
          debit: l.sens === 'debit' ? montant : 0,
          credit: l.sens === 'credit' ? montant : 0,
        });
      });

      brut.sort((a, b) => (jour(a.date) < jour(b.date) ? -1 : jour(a.date) > jour(b.date) ? 1 : 0));

      const debut = jour(dateDebut);
      const fin = jour(dateFin);

      let soldeOuverture = 0;
      const dansPeriode: MouvementBrut[] = [];
      brut.forEach((m) => {
        const j = jour(m.date);
        if (debut && j < debut) {
          soldeOuverture += effet(m.debit, m.credit);
        } else if (!fin || j <= fin) {
          dansPeriode.push(m);
        }
      });

      let cumul = soldeOuverture;
      let totalDebit = 0;
      let totalCredit = 0;
      const lignes: LigneGrandLivre[] = dansPeriode.map((m) => {
        cumul += effet(m.debit, m.credit);
        totalDebit += m.debit;
        totalCredit += m.credit;
        return {
          id: m.id,
          date: m.date,
          libelle: m.libelle,
          reference: m.reference,
          type: m.type,
          contrepartie: m.contrepartie,
          debit: m.debit,
          credit: m.credit,
          solde: cumul,
        };
      });

      return {
        compte,
        sens,
        soldeOuverture,
        lignes,
        totalDebit,
        totalCredit,
        soldeFinal: cumul,
      };
    },
    staleTime: 1000 * 60,
  });

// ============================================================
// ETAT DE TVA
// ============================================================
// La TVA n'est PAS ventilee dans transactions_comptables (les factures et
// saisies sont comptabilisees pour leur montant TTC sur un seul couple de
// comptes). L'etat est donc calcule a partir des documents sources :
//   - saisies_comptables (colonne `taxe`)
//   - factures           (colonne `tva`)
// Les ecritures eventuelles sur 447000 / 445000 (transactions_comptables
// ET ecritures multi-lignes) sont fournies a titre de rapprochement.

export interface LigneTva {
  key: string;
  source: 'saisie' | 'facture';
  sens: 'collectee' | 'deductible';
  date: string;
  reference: string;
  tiers: string;
  ht: number;
  tva: number;
  ttc: number;
}

export interface EtatTvaData {
  lignes: LigneTva[];
  ecritures: { tva_collectee_447: number; tva_445: number };
}

const TYPES_SAISIE_DEDUCTIBLE = ['facture_fournisseur', 'depense', 'autre'];

export const useEtatTva = (dateDebut: string, dateFin: string) =>
  useQuery<EtatTvaData, Error>({
    queryKey: ['etat_tva', dateDebut, dateFin],
    queryFn: async () => {
      const [saisiesRes, facturesRes, comptesRes] = await Promise.all([
        supabase
          .from('saisies_comptables')
          .select('id, type, beneficiaire, description, montant_ht, montant_ttc, taxe, date_operation')
          .gte('date_operation', dateDebut)
          .lte('date_operation', dateFin),
        supabase
          .from('factures')
          .select('id, type, numero, fournisseur_client_nom, montant_ht, tva, montant_ttc, statut, date_emission')
          .gte('date_emission', dateDebut)
          .lte('date_emission', dateFin)
          .neq('statut', 'brouillon'),
        supabase.from('comptes').select('id, numero').in('numero', ['445000', '447000']),
      ]);

      if (saisiesRes.error) throw new Error(saisiesRes.error.message);
      if (facturesRes.error) throw new Error(facturesRes.error.message);
      if (comptesRes.error) throw new Error(comptesRes.error.message);

      const lignes: LigneTva[] = [];

      (saisiesRes.data || []).forEach((s: any) => {
        const tva = Number(s.taxe) || 0;
        if (tva <= 0) return;
        let sens: 'collectee' | 'deductible' | null = null;
        if (s.type === 'facture_client') sens = 'collectee';
        else if (TYPES_SAISIE_DEDUCTIBLE.indexOf(s.type) !== -1) sens = 'deductible';
        if (!sens) return; // salaire, ajustement : hors TVA
        lignes.push({
          key: `s-${s.id}`,
          source: 'saisie',
          sens,
          date: s.date_operation,
          reference: s.description || s.type,
          tiers: s.beneficiaire || '',
          ht: Number(s.montant_ht) || 0,
          tva,
          ttc: Number(s.montant_ttc) || 0,
        });
      });

      (facturesRes.data || []).forEach((f: any) => {
        const tva = Number(f.tva) || 0;
        if (tva <= 0) return;
        lignes.push({
          key: `f-${f.id}`,
          source: 'facture',
          sens: f.type === 'emise' ? 'collectee' : 'deductible',
          date: f.date_emission,
          reference: f.numero || '',
          tiers: f.fournisseur_client_nom || '',
          ht: Number(f.montant_ht) || 0,
          tva,
          ttc: Number(f.montant_ttc) || 0,
        });
      });

      lignes.sort((a, b) => (jour(a.date) < jour(b.date) ? -1 : jour(a.date) > jour(b.date) ? 1 : 0));

      // Rapprochement avec les ecritures sur 447000 / 445000 (info) —
      // fusion de transactions_comptables ET des écritures multi-lignes.
      const ecritures = { tva_collectee_447: 0, tva_445: 0 };
      const cpts = (comptesRes.data || []) as { id: string; numero: string }[];
      if (cpts.length > 0) {
        const ids = cpts.map((c) => c.id).join(',');
        const id447 = (cpts.filter((c) => c.numero === '447000')[0] || {}).id;
        const id445 = (cpts.filter((c) => c.numero === '445000')[0] || {}).id;

        const [trRes, elRes] = await Promise.all([
          supabase
            .from('transactions_comptables')
            .select('compte_debit_id, compte_credit_id, montant, date_transaction')
            .or(`compte_debit_id.in.(${ids}),compte_credit_id.in.(${ids})`),
          supabase
            .from('v_ecritures_detail')
            .select('compte_id, sens, montant, date_ecriture')
            .in('compte_id', cpts.map((c) => c.id)),
        ]);
        if (trRes.error) throw new Error(trRes.error.message);
        if (elRes.error) throw new Error(elRes.error.message);

        (trRes.data || []).forEach((t: any) => {
          const j = jour(t.date_transaction);
          if (j < dateDebut || j > dateFin) return;
          const m = Number(t.montant) || 0;
          if (id447) {
            if (t.compte_credit_id === id447) ecritures.tva_collectee_447 += m;
            if (t.compte_debit_id === id447) ecritures.tva_collectee_447 -= m;
          }
          if (id445) {
            if (t.compte_credit_id === id445) ecritures.tva_445 += m;
            if (t.compte_debit_id === id445) ecritures.tva_445 -= m;
          }
        });

        (elRes.data || []).forEach((l: any) => {
          const j = jour(l.date_ecriture);
          if (j < dateDebut || j > dateFin) return;
          const m = Number(l.montant) || 0;
          const signe = l.sens === 'credit' ? 1 : -1;
          if (id447 && l.compte_id === id447) ecritures.tva_collectee_447 += signe * m;
          if (id445 && l.compte_id === id445) ecritures.tva_445 += signe * m;
        });
      }

      return { lignes, ecritures };
    },
    staleTime: 1000 * 60,
  });
