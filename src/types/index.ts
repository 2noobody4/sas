// ============================================================
// TYPES — Point d'export central
// Version V3 — Compatible React 16
// ============================================================

// ============================================================
// TYPES DE BASE (exportés en premier)
// ============================================================
export * from './css';
export * from './theme';
export * from './navigation';

// ============================================================
// MODULES (exporté après les types de base)
// ============================================================
export * from './modules';

// ============================================================
// SERVICES
// ============================================================
export * from './services';
export * from './attributsService';

// ============================================================
// MÉTIER — RÉ-EXPORT AVEC "export type"
// ============================================================

// stock.ts
export type {
  Produit,
  ProduitFormData,
  Categorie,
  Fournisseur,
  MouvementStock,
  TypeMouvement,
  SessionInventaire,
  LigneInventaire,
  StatutInventaire,
  SessionInventaireFormData,
  LigneInventaireFormData,
  Promotion,
  PromotionFormData,
} from './stock';

// boutique.ts
export type {
  Panier,
  PanierItem,
  Commande,
  CommandeItem,
  CommandeFormData,
  StatutCommande,
} from './boutique';

// caisse.ts
export type {
  SessionCaisse,
  SessionFormData,
  Vente,
  VenteFormData,
  VenteStatut,
  LigneVente,
  Paiement,
  PaiementFormData,
  MoyenPaiement,
  RapportCaisse,
  SessionStatut,
} from './caisse';

// clients.ts
export type {
  Client,
  ClientFormData,
  TypeClient,
  SegmentClient,
  NiveauFidelite,
  Interaction,
  InteractionFormData,
  TypeInteraction,
  TransactionClient,
  NiveauFideliteConfig,
  ClientStats,
} from './clients';

// commandeClient.ts
export type {
  CommandeClient,
  CommandeClientFormData,
  LigneCommandeClient,
  StatutCommandeClient,
} from './commandeClient';

// comptabilite.ts
export type {
  Compte,
  CompteFormData,
  TypeCompte,
  TransactionComptable,
  TransactionFormData,
  TypeTransaction,
  Exercice,
  ExerciceFormData,
  Bilan,
  CompteResultat,
  JournalEntry,
  SaisieComptable,
  SaisieFormData,
  ClotureExercice,
} from './comptabilite';

// entrepot.ts
export type {
  Entrepot,
  EntrepotFormData,
  TransfertEntrepot,
  TransfertFormData,
} from './entrepot';

// emplacementEntrepot.ts
export type {
  EmplacementEntrepot,
  EmplacementEntrepotFormData,
} from './emplacementEntrepot';

// facture.ts
export type {
  Facture,
  FactureFormData,
  FactureType,
  FactureStatut,
} from './facture';

// historique.ts
export type {
  HistoriqueAction,
  HistoriqueFilter,
  ModuleType,
  ActionType,
  EntityType,
} from './historique';

// homeConfig.ts
export type {
  HomeBlock,
  HomeConfig,
  HomeBlockFormData,
} from './homeConfig';

// magasins.ts
export type {
  Magasin,
  MagasinFormData,
} from './magasins';

// messages.ts
export type {
  Message,
  MessageFormData,
  MessageFilter,
  Conversation,
} from './messages';

// notification.ts
export type {
  Notification,
  NotificationFilter,
  NotificationType,
} from './notification';

// promotion.ts
export type {
  Promotion as PromotionType,
  PromotionFormData as PromotionFormDataType,
  Tarification,
  TarificationFormData,
  Negociation,
  NegociationFormData,
  NegociationStatut,
} from './promotion';

// rh.ts
export type {
  Employe,
  Contrat,
  FichePaie,
  Conge,
  Pointage,
  EmployeFormData,
  ContratFormData,
  FichePaieFormData,
  CongeFormData,
  PointageFormData,
  StatutEmploye,
  TypeContrat,
  StatutContrat,
  StatutFichePaie,
  TypeConge,
  StatutConge,
  StatutPointage,
  TypePaiement,
  AvanceSalaire,
  POSTES,
  Poste,
} from './rh';

// menu.ts
export type {
  MenuItem,
  MenuItemFormData,
} from './menu';

// transactions.ts
export type {
  TransactionComptable as TransactionComptableType,
  TransactionFormData as TransactionFormDataType,
  TransactionFilters,
} from './transactions';

// ============================================================
// RÉ-EXPORT POUR COMPATIBILITÉ
// ============================================================
export type { NavItem as NavItemType } from './navigation';
export type { Style as StyleType } from './theme';
export type { Animation as AnimationType } from './theme';
