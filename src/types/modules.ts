// ============================================================
// APP PME — STRUCTURE DE DONNÉES FINALE
// Consolide les modules métier + le module Style
// Version V3 — Compatible React 16
// ============================================================

// ============================================================
// COMMUN — Magasin / Entrepôt
// ============================================================

export type Magasin = {
  id: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  actif: boolean;
};

export type Entrepot = {
  id: string;
  nom: string;
  adresse?: string;
  magasinId?: string;
  actif: boolean;
};

// ============================================================
// MODULE STOCKS / PRODUITS
// ============================================================

export type Produit = {
  id: string;
  nom: string;
  description?: string;
  prixAchat: number;
  prixVente: number;
  quantite: number;
  seuilAlerte: number;
  unite: string;
  categorieId?: string;
  imageUrl?: string;
  actif: boolean;
  magasinId?: string;
  entrepotId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Categorie = {
  id: string;
  nom: string;
  description?: string;
  parentId?: string;
};

export type MouvementStock = {
  id: string;
  produitId: string;
  type: "entree" | "sortie" | "ajustement";
  quantite: number;
  motif?: string;
  date: string;
  changementMagasin: boolean;
  nouveauMagasinId?: string;
  changementEntrepot: boolean;
  nouveauEntrepotId?: string;
  utilisateurId: string;
};

export type Fournisseur = {
  id: string;
  nom: string;
  contact?: string;
  email?: string;
  adresse?: string;
  produitsIds?: string[];
  actif: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommandeFournisseur = {
  id: string;
  fournisseurId: string;
  statut: "brouillon" | "envoyee" | "partiellement_recue" | "recue" | "annulee";
  lignes: LigneCommande[];
  dateCommande: string;
  dateReceptionPrevue?: string;
  magasinId?: string;
  entrepotId?: string;
  utilisateurId: string;
  createdAt: string;
  updatedAt: string;
};

export type LigneCommande = {
  produitId: string;
  quantite: number;
  quantiteRecue: number;
  prixUnitaire: number;
};

// ============================================================
// MODULE PROFIL
// ============================================================

export type Utilisateur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photoUrl?: string;
  roleId: string;
  fournisseurId?: string;
  engagementId?: string;
  actif: boolean;
  magasinId?: string;
  entrepotId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: string;
  nom: string; // "admin", "comptable", "cashier", "magasinier", "employe", "client", "fournisseur", "gestionnaire"
  description?: string;
  permissions: string[];
};

export type Engagement = {
  id: string;
  point: number;
  decoration: "bronze" | "argent" | "gold" | "platine" | "diamant";
};

// ============================================================
// MODULE CAISSE
// ============================================================

export type SessionCaisse = {
  id: string;
  utilisateurId: string;
  magasinId: string;
  entrepotId?: string;
  fondCaisseOuverture: number;
  fondCaisseFermeture?: number;
  ecart?: number;
  dateOuverture: string;
  dateFermeture?: string;
  statut: "ouverte" | "fermee";
};

export type Vente = {
  id: string;
  sessionCaisseId: string;
  clientId?: string;
  caissierId: string;
  lignes: LigneVente[];
  paiements: Paiement[];
  montantTotal: number;
  statut: "en_cours" | "validee" | "annulee";
  date: string;
};

export type LigneVente = {
  produitId: string;
  quantite: number;
  prixUnitaire: number;
  remise?: number;
};

export type Paiement = {
  moyen: "especes" | "mobile_money" | "carte" | "cheque";
  montant: number;
};

// ============================================================
// MODULE COMPTABILITÉ
// ============================================================

export type Depense = {
  id: string;
  categorie: string;
  montant: number;
  description?: string;
  date: string;
  magasinId?: string;
  utilisateurId: string;
  justificatifUrl?: string;
  createdAt: string;
};

export type Facture = {
  id: string;
  numero: string;
  clientId?: string;
  emisParId: string;
  venteId?: string;
  lignes: LigneFacture[];
  montantTotal: number;
  statut: "brouillon" | "envoyee" | "partiellement_payee" | "payee" | "en_retard" | "annulee";
  dateEmission: string;
  dateEcheance?: string;
  paiements: PaiementFacture[];
  createdAt: string;
  updatedAt: string;
};

export type LigneFacture = {
  designation: string;
  quantite: number;
  prixUnitaire: number;
};

export type PaiementFacture = {
  id: string;
  montant: number;
  moyen: "especes" | "mobile_money" | "carte" | "cheque";
  date: string;
};

// ============================================================
// MODULE RH
// ============================================================

export type Employe = {
  id: string;
  utilisateurId: string;
  poste: string;
  dateEmbauche: string;
  magasinId?: string;
  actif: boolean;
};

export type Contrat = {
  id: string;
  employeId: string;
  type: "cdi" | "cdd" | "stage" | "prestataire";
  dateDebut: string;
  dateFin?: string;
  salaireBase: number;
  fichierUrl?: string;
  statut: "actif" | "termine" | "resilie";
  createdAt: string;
};

export type FichePaie = {
  id: string;
  employeId: string;
  periode: string;
  primes?: number;
  deductions?: number;
  avancesDeduites?: AvanceSalaire[];
  montantNet: number;
  statut: "brouillon" | "validee" | "payee";
  datePaiement?: string;
  createdAt: string;
};

export type AvanceSalaire = {
  id: string;
  employeId: string;
  montant: number;
  dateAvance: string;
  statut: "en_attente" | "approuvee" | "remboursee";
  approuveParId?: string;
  fichePaieId?: string;
  createdAt: string;
};

export type Pointage = {
  id: string;
  employeId: string;
  date: string;
  heureArrivee?: string;
  heureDepart?: string;
  statut: "present" | "absent" | "retard" | "conge";
};

export type Conge = {
  id: string;
  employeId: string;
  type: "conge_paye" | "maladie" | "sans_solde" | "autre";
  dateDebut: string;
  dateFin: string;
  statut: "en_attente" | "approuve" | "refuse";
  approuveParId?: string;
};

export type Evaluation = {
  id: string;
  employeId: string;
  evaluateurId: string;
  periode: string;
  criteres: CritereEvaluation[];
  commentaire?: string;
  date: string;
};

export type CritereEvaluation = {
  nom: string;
  note: number;
};

// ============================================================
// MODULE BOUTIQUE
// ============================================================

export type TemplateAnnonce = "classic" | "produit_focus" | "minimal";

export type Banniere = {
  id: string;
  imageUrl: string;
  titre?: string;
  lien?: string;
  produitId?: string;
  template: TemplateAnnonce;
  dateDebut: string;
  dateFin: string;
  magasinId?: string;
  ordre?: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Annonce = {
  id: string;
  titre: string;
  description?: string;
  produitId?: string;
  template: TemplateAnnonce;
  dateDebut: string;
  dateFin: string;
  magasinId?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
};

// ============================================================
// MODULE MESSAGERIE
// ============================================================

export type Conversation = {
  id: string;
  participant1Id: string;
  participant2Id: string;
  dernierMessageId?: string;
  createdAt: string;
  updatedAt: string;
};

export type PieceJointe = {
  url: string;
  type: "image" | "document" | "audio";
  nom: string;
  taille?: number;
};

export type Message = {
  id: string;
  conversationId: string;
  expediteurId: string;
  contenu?: string;
  pieceJointe?: PieceJointe;
  lu: boolean;
  dateEnvoi: string;
};
