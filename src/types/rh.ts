import { Utilisateur as User } from './modules';

export type StatutEmploye = 'actif' | 'inactif' | 'conge';
export type TypeContrat = 'cdi' | 'cdd' | 'stage' | 'prestataire';
export type StatutContrat = 'actif' | 'termine' | 'resilie';
export type StatutFichePaie = 'brouillon' | 'validee' | 'payee';
export type TypeConge = 'conge_paye' | 'maladie' | 'sans_solde' | 'autre';
export type StatutConge = 'en_attente' | 'approuve' | 'refuse';
export type StatutPointage = 'present' | 'absent' | 'retard' | 'conge';
export type TypePaiement = 'reglement' | 'avance';

export interface Employe {
  id: string;
  user_id: string;
  user?: User;
  poste: string;
  date_embauche: string;
  salaire_base: number;
  statut: StatutEmploye;
  magasin_id?: string;
  contrat_url?: string;
  type_contrat?: TypeContrat;
  created_at: string;
  updated_at: string;
}

export interface Contrat {
  id: string;
  employe_id: string;
  employe?: Employe;
  type: TypeContrat;
  date_debut: string;
  date_fin?: string;
  salaire_base: number;
  fichier_url?: string;
  statut: StatutContrat;
  created_at: string;
}

export interface FichePaie {
  id: string;
  employe_id: string;
  employe?: Employe;
  periode: string;
  salaire_base: number;
  primes: number;
  deductions: number;
  montant_net: number;
  statut: StatutFichePaie;
  type?: TypePaiement;
  date_paiement?: string;
  transaction_id?: string; // 🔧 Lien vers transactions_comptables (ajouté)
  created_at: string;
  updated_at: string;
}

export interface Conge {
  id: string;
  employe_id: string;
  employe?: Employe;
  type: TypeConge;
  date_debut: string;
  date_fin: string;
  statut: StatutConge;
  approuve_par_id?: string;
  approuve_par?: User;
  created_at: string;
}

export interface Pointage {
  id: string;
  employe_id: string;
  employe?: Employe;
  date: string;
  heure_arrivee?: string;
  heure_depart?: string;
  statut: StatutPointage;
  created_at: string;
}

export interface EmployeFormData {
  user_id: string;
  poste: string;
  date_embauche: string;
  salaire_base: number;
  statut?: StatutEmploye;
  magasin_id?: string;
  type_contrat?: TypeContrat;
  contrat_url?: string;
}

export interface ContratFormData {
  employe_id: string;
  type: TypeContrat;
  date_debut: string;
  date_fin?: string;
  salaire_base: number;
  fichier_url?: string;
  statut?: StatutContrat;
}

export interface FichePaieFormData {
  employe_id: string;
  periode: string;
  salaire_base: number;
  primes: number;
  deductions: number;
  statut?: StatutFichePaie;
  type?: TypePaiement;
  date_paiement?: string;
}

export interface CongeFormData {
  employe_id: string;
  type: TypeConge;
  date_debut: string;
  date_fin: string;
}

export interface PointageFormData {
  employe_id: string;
  date: string;
  heure_arrivee?: string;
  heure_depart?: string;
  statut?: StatutPointage;
}

// ============================================================
// AVANCES SALAIRE
// ============================================================

export interface AvanceSalaire {
  id: string;
  employe_id: string;
  employe?: Employe;
  montant: number;
  date_avance: string;
  statut: 'en_attente' | 'approuvee' | 'remboursee';
  approuve_par_id?: string;
  approuve_par?: User;
  fiche_paie_id?: string;
  fiche_paie?: FichePaie;
  created_at: string;
  updated_at: string;
}

export interface AvanceSalaireFormData {
  employe_id: string;
  montant: number;
  date_avance: string;
  statut?: 'en_attente' | 'approuvee' | 'remboursee';
}

// ============================================================
// POSTES
// ============================================================

export const POSTES = [
  'Directeur General',
  'Directeur Administratif et Financier',
  'Directeur Commercial',
  'Directeur des Operations',
  'Responsable RH',
  'Responsable Comptabilite',
  'Responsable Stock',
  'Responsable Logistique',
  'Commercial',
  'Charge de clientele',
  'Responsable des ventes',
  'Teleconseiller',
  'Agent commercial',
  'Comptable',
  'Gestionnaire de paie',
  'Tresorier',
  'Analyste financier',
  'Controleur de gestion',
  'Assistant RH',
  'Charge de recrutement',
  'Assistant administratif',
  'Secretaire de direction',
  'Gestionnaire du personnel',
  'Magasinier',
  'Gestionnaire de stock',
  'Responsable approvisionnement',
  'Preparateur de commandes',
  'Cariste',
  'Livreur',
  'Chauffeur-livreur',
  'Agent de securite',
  'Gardien',
  'Technicien de surface',
  'Agent d entretien',
  'Maintenance',
  'Conseiller clientele',
  'Support technique',
  'Responsable relation client',
  'Stagiaire',
  'Apprenti',
  'Consultant',
  'Prestataire',
  'Autre',
] as const;

export type Poste = typeof POSTES[number];
