export type FactureType = 'emise' | 'recue';
export type FactureStatut = 'brouillon' | 'envoyee' | 'payee' | 'en_retard';

export interface Facture {
  id: string;
  type: FactureType;
  numero: string;
  date_emission: string;
  date_echeance?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  statut: FactureStatut;
  fournisseur_client_id?: string;
  fournisseur_client_nom?: string;
  description?: string;
  fichier_url?: string;
  rappel_envoye: boolean;
  user_id: string;
  transaction_id?: string; // 🔥 Lien vers transactions_comptables
  compte_debit_id?: string; // 🔥 Lien vers comptes
  compte_credit_id?: string; // 🔥 Lien vers comptes
  created_at: string;
  updated_at: string;
}

export interface FactureFormData {
  type: FactureType;
  numero: string;
  date_emission: string;
  date_echeance?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  statut: FactureStatut;
  fournisseur_client_nom?: string;
  description?: string;
  fichier_url?: string;
  compte_debit_id?: string;
  compte_credit_id?: string;
}
