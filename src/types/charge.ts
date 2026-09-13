/**
 * TYPES – Charges et charges usuelles
 * Compatible React 16.14
 */

// ============================================================
// CHARGE USUELLE
// ============================================================

export interface ChargeUsuelle {
  id: string;
  nom: string;
  description?: string;
  type: 'fixe' | 'variable' | 'frais_financier' | 'impot' | 'service' | 'personnel' | 'dotation' | 'autre';
  montant_defaut?: number;
  periodicite: 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel' | 'ponctuel';
  compte_debit_id: string;
  compte_credit_id: string;
  compte_debit_numero?: string;
  compte_credit_numero?: string;
  tva: boolean;
  taux_tva?: number;
  actif: boolean;
  magasin_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChargeUsuelleFormData {
  nom: string;
  description?: string;
  type: 'fixe' | 'variable' | 'frais_financier' | 'impot' | 'service' | 'personnel' | 'dotation' | 'autre';
  montant_defaut?: number;
  periodicite: 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel' | 'ponctuel';
  compte_debit_id: string;
  compte_credit_id: string;
  tva?: boolean;
  taux_tva?: number;
  actif?: boolean;
}

// ============================================================
// CHARGES USUELLES PRÉDÉFINIES
// ============================================================

export const CHARGES_USUELLES_PAR_DEFAUT: Omit<ChargeUsuelle, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'magasin_id'>[] = [
  // Charges de personnel
  {
    nom: 'Salaires',
    description: 'Salaires mensuels du personnel',
    type: 'personnel',
    periodicite: 'mensuel',
    compte_debit_id: '', // Sera rempli avec le compte 641000
    compte_credit_id: '', // Sera rempli avec le compte 521000
    tva: false,
    actif: true,
  },
  {
    nom: 'Charges sociales (CNSS, IPRES)',
    description: 'Cotisations sociales employeur',
    type: 'personnel',
    periodicite: 'mensuel',
    compte_debit_id: '', // 641000
    compte_credit_id: '', // 431000 (Dettes sociales)
    tva: false,
    actif: true,
  },
  
  // Charges de services
  {
    nom: 'Électricité',
    description: 'Facture d\'électricité',
    type: 'service',
    periodicite: 'mensuel',
    compte_debit_id: '', // 621000
    compte_credit_id: '', // 521000
    tva: true,
    taux_tva: 18,
    actif: true,
  },
  {
    nom: 'Eau',
    description: 'Facture d\'eau',
    type: 'service',
    periodicite: 'mensuel',
    compte_debit_id: '', // 622000
    compte_credit_id: '', // 521000
    tva: true,
    taux_tva: 18,
    actif: true,
  },
  {
    nom: 'Internet et téléphone',
    description: 'Abonnement internet et téléphone',
    type: 'service',
    periodicite: 'mensuel',
    compte_debit_id: '', // 623000
    compte_credit_id: '', // 521000
    tva: true,
    taux_tva: 18,
    actif: true,
  },
  {
    nom: 'Loyer',
    description: 'Loyer des locaux',
    type: 'service',
    periodicite: 'mensuel',
    compte_debit_id: '', // 624000
    compte_credit_id: '', // 521000
    tva: false,
    actif: true,
  },
  {
    nom: 'Assurances',
    description: 'Primes d\'assurance',
    type: 'service',
    periodicite: 'annuel',
    compte_debit_id: '', // 625000
    compte_credit_id: '', // 521000
    tva: false,
    actif: true,
  },
  {
    nom: 'Maintenance',
    description: 'Maintenance des équipements',
    type: 'service',
    periodicite: 'ponctuel',
    compte_debit_id: '', // 626000
    compte_credit_id: '', // 521000
    tva: true,
    taux_tva: 18,
    actif: true,
  },

  // Frais financiers
  {
    nom: 'Intérêts bancaires',
    description: 'Frais et intérêts bancaires',
    type: 'frais_financier',
    periodicite: 'mensuel',
    compte_debit_id: '', // 671000
    compte_credit_id: '', // 521000
    tva: false,
    actif: true,
  },
  {
    nom: 'Commissions bancaires',
    description: 'Commissions et frais de tenue de compte',
    type: 'frais_financier',
    periodicite: 'mensuel',
    compte_debit_id: '', // 671000
    compte_credit_id: '', // 521000
    tva: false,
    actif: true,
  },

  // Impôts et taxes
  {
    nom: 'Impôt sur le revenu (IRPP)',
    description: 'Impôt sur le revenu des personnes physiques',
    type: 'impot',
    periodicite: 'mensuel',
    compte_debit_id: '', // 645000
    compte_credit_id: '', // 441000 (Dettes fiscales)
    tva: false,
    actif: true,
  },
  {
    nom: 'Taxe d\'apprentissage',
    description: 'Taxe d\'apprentissage',
    type: 'impot',
    periodicite: 'annuel',
    compte_debit_id: '', // 645000
    compte_credit_id: '', // 441000
    tva: false,
    actif: true,
  },
  {
    nom: 'TVA due',
    description: 'TVA à payer',
    type: 'impot',
    periodicite: 'mensuel',
    compte_debit_id: '', // 445000
    compte_credit_id: '', // 441000
    tva: false,
    actif: true,
  },

  // Autres charges
  {
    nom: 'Fournitures de bureau',
    description: 'Fournitures et consommables de bureau',
    type: 'autre',
    periodicite: 'ponctuel',
    compte_debit_id: '', // 651000
    compte_credit_id: '', // 521000
    tva: true,
    taux_tva: 18,
    actif: true,
  },
  {
    nom: 'Petit équipement',
    description: 'Achat de petit équipement (outillage)',
    type: 'autre',
    periodicite: 'ponctuel',
    compte_debit_id: '', // 651000
    compte_credit_id: '', // 521000
    tva: true,
    taux_tva: 18,
    actif: true,
  },
  {
    nom: 'Formation du personnel',
    description: 'Frais de formation continue',
    type: 'personnel',
    periodicite: 'ponctuel',
    compte_debit_id: '', // 641000
    compte_credit_id: '', // 521000
    tva: false,
    actif: true,
  },
  {
    nom: 'Communication et publicité',
    description: 'Frais de communication et publicité',
    type: 'service',
    periodicite: 'ponctuel',
    compte_debit_id: '', // 627000
    compte_credit_id: '', // 521000
    tva: true,
    taux_tva: 18,
    actif: true,
  },
];

// ============================================================
// COMPTES ASSOCIÉS AUX CHARGES (numéros par défaut)
// ============================================================

export const COMPTES_CHARGES: Record<string, { numero: string; nom: string }> = {
  'personnel': { numero: '641000', nom: 'Charges de personnel' },
  'service': { numero: '621000', nom: 'Services extérieurs' },
  'frais_financier': { numero: '671000', nom: 'Intérêts et frais financiers' },
  'impot': { numero: '645000', nom: 'Impôts et taxes' },
  'dotation': { numero: '681000', nom: 'Dotations aux amortissements' },
  'autre': { numero: '651000', nom: 'Autres charges' },
};

export const COMPTES_CREDIT: Record<string, { numero: string; nom: string }> = {
  'banque': { numero: '521000', nom: 'Banque' },
  'caisse': { numero: '571000', nom: 'Caisse' },
  'dettes_sociales': { numero: '431000', nom: 'Dettes sociales' },
  'dettes_fiscales': { numero: '441000', nom: 'Dettes fiscales' },
  'fournisseur': { numero: '401000', nom: 'Fournisseurs' },
};
