/**
 * Plan comptable OHADA (SYSCOHADA révisé) — jeu de comptes de base
 * ------------------------------------------------------------
 * 🆕 Fichier manquant : sans cette liste, AUCUN compte n'existe jamais
 * dans l'application (PlanComptablePage était en lecture seule, sans
 * bouton de création ni d'initialisation). Or tout le "pré-remplissage"
 * des écritures comptables (ventes, achats, factures, charges usuelles,
 * paie, demandes de service...) recherche des comptes par NUMÉRO
 * (571000, 521000, 701000, 401000, 411000...) : si ces comptes
 * n'existent pas, toutes les comptabilisations automatiques échouent
 * silencieusement (comptes introuvables).
 *
 * Cette liste couvre :
 *  - tous les numéros déjà référencés ailleurs dans le code (voir
 *    useVentes, useMouvements, useReapprovisionnement, useFactures,
 *    useRH, useChargesUsuelles, DemandesServicePage...)
 *  - un jeu de comptes de base suffisant pour une PME (classes 1 à 7)
 *
 * Utilisé par `useInitPlanComptable` (src/hooks/useInitPlanComptable.ts).
 */

import { TypeCompte } from '../types/comptabilite';

export interface CompteOhadaSeed {
  numero: string;
  nom: string;
  type: TypeCompte;
  niveau: number;
}

export const PLAN_COMPTABLE_OHADA_BASE: CompteOhadaSeed[] = [
  // ============================================================
  // CLASSE 1 — Comptes de ressources durables (passif)
  // ============================================================
  { numero: '101000', nom: 'Capital social', type: 'passif', niveau: 1 },
  { numero: '110000', nom: 'Report à nouveau', type: 'passif', niveau: 1 },
  { numero: '120000', nom: "Résultat de l'exercice", type: 'passif', niveau: 1 },
  { numero: '161000', nom: 'Emprunts auprès des établissements de crédit', type: 'passif', niveau: 1 },
  { numero: '168000', nom: 'Autres dettes financières', type: 'passif', niveau: 1 },

  // ============================================================
  // CLASSE 2 — Actif immobilisé
  // ============================================================
  { numero: '211000', nom: 'Terrains', type: 'actif', niveau: 1 },
  { numero: '231000', nom: 'Bâtiments', type: 'actif', niveau: 1 },
  { numero: '241000', nom: 'Matériel et outillage industriel', type: 'actif', niveau: 1 },
  { numero: '244000', nom: 'Matériel et mobilier de bureau', type: 'actif', niveau: 1 },
  { numero: '245000', nom: 'Matériel de transport', type: 'actif', niveau: 1 },
  { numero: '281000', nom: 'Amortissements des immobilisations', type: 'actif', niveau: 1 },

  // ============================================================
  // CLASSE 3 — Stocks
  // ============================================================
  { numero: '311000', nom: 'Marchandises', type: 'actif', niveau: 1 },
  { numero: '321000', nom: 'Matières premières', type: 'actif', niveau: 1 },
  { numero: '355000', nom: 'Produits finis', type: 'actif', niveau: 1 },

  // ============================================================
  // CLASSE 4 — Tiers
  // ============================================================
  { numero: '401000', nom: 'Fournisseurs', type: 'passif', niveau: 1 },
  { numero: '409000', nom: 'Fournisseurs débiteurs (avances versées)', type: 'actif', niveau: 1 },
  { numero: '411000', nom: 'Clients', type: 'actif', niveau: 1 },
  { numero: '419100', nom: 'Clients, avances et acomptes reçus', type: 'passif', niveau: 1 },
  { numero: '421000', nom: 'Personnel, avances et acomptes', type: 'actif', niveau: 1 },
  { numero: '431000', nom: 'Sécurité sociale (CNSS, IPRES...)', type: 'passif', niveau: 1 },
  { numero: '441000', nom: "État, impôts et taxes à payer", type: 'passif', niveau: 1 },
  { numero: '445000', nom: 'État, TVA à décaisser', type: 'passif', niveau: 1 },
  { numero: '447000', nom: 'État, TVA collectée', type: 'passif', niveau: 1 },

  // ============================================================
  // CLASSE 5 — Trésorerie
  // ============================================================
  { numero: '521000', nom: 'Banque', type: 'actif', niveau: 1 },
  { numero: '531000', nom: 'Chèques postaux', type: 'actif', niveau: 1 },
  { numero: '571000', nom: 'Caisse', type: 'actif', niveau: 1 },
  { numero: '585000', nom: 'Virements de fonds internes', type: 'actif', niveau: 1 },

  // ============================================================
  // CLASSE 6 — Charges
  // ============================================================
  { numero: '601000', nom: 'Achats de marchandises', type: 'charge', niveau: 1 },
  { numero: '611000', nom: 'Achats de matières premières / charges fournisseurs', type: 'charge', niveau: 1 },
  { numero: '621000', nom: "Sous-traitance générale / Électricité", type: 'charge', niveau: 1 },
  { numero: '622000', nom: 'Eau', type: 'charge', niveau: 1 },
  { numero: '623000', nom: 'Internet et téléphone', type: 'charge', niveau: 1 },
  { numero: '624000', nom: 'Loyer et charges locatives', type: 'charge', niveau: 1 },
  { numero: '625000', nom: 'Assurances', type: 'charge', niveau: 1 },
  { numero: '626000', nom: 'Entretien, réparations et maintenance', type: 'charge', niveau: 1 },
  { numero: '627000', nom: 'Publicité, communication', type: 'charge', niveau: 1 },
  { numero: '628000', nom: 'Frais de télécommunication', type: 'charge', niveau: 1 },
  { numero: '641000', nom: 'Charges de personnel (salaires)', type: 'charge', niveau: 1 },
  { numero: '645000', nom: 'Impôts et taxes', type: 'charge', niveau: 1 },
  { numero: '651000', nom: 'Autres charges (fournitures, petit équipement)', type: 'charge', niveau: 1 },
  { numero: '671000', nom: 'Intérêts et frais financiers', type: 'charge', niveau: 1 },
  { numero: '681000', nom: 'Dotations aux amortissements', type: 'charge', niveau: 1 },

  // ============================================================
  // CLASSE 7 — Produits
  // ============================================================
  { numero: '701000', nom: 'Ventes de marchandises', type: 'produit', niveau: 1 },
  { numero: '706000', nom: 'Prestations de services', type: 'produit', niveau: 1 },
  { numero: '707000', nom: 'Ventes de produits finis', type: 'produit', niveau: 1 },
  { numero: '758000', nom: 'Produits divers', type: 'produit', niveau: 1 },
  { numero: '771000', nom: 'Intérêts et produits financiers', type: 'produit', niveau: 1 },
];
