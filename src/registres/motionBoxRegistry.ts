import { ComponentStyle } from '../types/theme';

export interface MotionBoxUsage {
  id: string;
  type: string;
  variant?: string;
  page: string;
  parentLevel: number;
  isChildren: boolean;
  filePath?: string;
  description?: string;
}

// ✅ Registre central des utilisations de MotionBox par page
export const MOTIONBOX_USAGES: MotionBoxUsage[] = [
  { id: 'app-page', type: 'page', variant: 'default', page: 'Application', parentLevel: 0, isChildren: false, filePath: 'src/components/ui/PageWrapper.tsx', description: 'Conteneur universel des pages' },
  // ============================================================
  // PAGE D'ACCUEIL (HomePage)
  // ============================================================
  { id: 'home-hero', type: 'card', variant: 'large', page: 'HomePage', parentLevel: 0, isChildren: false, description: 'Hero principal' },
  { id: 'home-features', type: 'card', variant: 'medium', page: 'HomePage', parentLevel: 0, isChildren: false, description: 'Carte des fonctionnalités' },
  { id: 'home-products', type: 'card', variant: 'default', page: 'HomePage', parentLevel: 0, isChildren: false, description: 'Liste des produits' },
  { id: 'home-cta', type: 'card', variant: 'large', page: 'HomePage', parentLevel: 0, isChildren: false, description: 'Appel à l\'action' },

  // ============================================================
  // TABLEAU DE BORD (Dashboard)
  // ============================================================
  { id: 'dashboard-stats', type: 'card', variant: 'medium', page: 'DashboardRoot', parentLevel: 0, isChildren: false, description: 'Cartes statistiques' },
  { id: 'dashboard-history', type: 'card', variant: 'default', page: 'DashboardRoot', parentLevel: 0, isChildren: false, description: 'Historique des activités' },

  // ============================================================
  // STOCKS
  // ============================================================
  { id: 'stocks-list', type: 'card', variant: 'elevated', page: 'StocksPage', parentLevel: 0, isChildren: false, description: 'Tableau des produits' },
  { id: 'stocks-filter', type: 'card', variant: 'medium', page: 'StocksPage', parentLevel: 0, isChildren: false, description: 'Filtres des produits' },
  { id: 'stocks-form', type: 'card', variant: 'xlarge', page: 'ProductFormPage', parentLevel: 0, isChildren: false, description: 'Formulaire produit' },

  // ============================================================
  // CAISSE
  // ============================================================
  { id: 'caisse-sessions', type: 'card', variant: 'elevated', page: 'SessionsPage', parentLevel: 0, isChildren: false, description: 'Liste des sessions' },
  { id: 'caisse-ventes', type: 'card', variant: 'elevated', page: 'VentesPage', parentLevel: 0, isChildren: false, description: 'Liste des ventes' },
  { id: 'caisse-vente-form', type: 'card', variant: 'default', page: 'VenteFormPage', parentLevel: 0, isChildren: false, description: 'Formulaire de vente' },

  // ============================================================
  // RH
  // ============================================================
  { id: 'rh-employes', type: 'card', variant: 'elevated', page: 'EmployesPage', parentLevel: 0, isChildren: false, description: 'Liste des employés' },
  { id: 'rh-form', type: 'card', variant: 'elevated', page: 'EmployeFormPage', parentLevel: 0, isChildren: false, description: 'Formulaire employé' },
  { id: 'rh-conges', type: 'card', variant: 'elevated', page: 'CongesPage', parentLevel: 0, isChildren: false, description: 'Liste des congés' },

  // ============================================================
  // CLIENTS
  // ============================================================
  { id: 'clients-list', type: 'card', variant: 'elevated', page: 'ClientsPage', parentLevel: 0, isChildren: false, description: 'Liste des clients' },
  { id: 'clients-detail', type: 'card', variant: 'elevated', page: 'ClientDetailPage', parentLevel: 0, isChildren: false, description: 'Fiche client' },
  { id: 'clients-form', type: 'card', variant: 'elevated', page: 'ClientFormPage', parentLevel: 0, isChildren: false, description: 'Formulaire client' },

  // ============================================================
  // COMPTABILITÉ
  // ============================================================
  { id: 'compta-journal', type: 'card', variant: 'elevated', page: 'JournalPage', parentLevel: 0, isChildren: false, description: 'Journal comptable' },
  { id: 'compta-bilan', type: 'card', variant: 'elevated', page: 'BilanPage', parentLevel: 0, isChildren: false, description: 'Bilan comptable' },
  { id: 'compta-factures', type: 'card', variant: 'elevated', page: 'FacturesPage', parentLevel: 0, isChildren: false, description: 'Liste des factures' },

  // ============================================================
  // GESTION (ManagementRoot)
  // ============================================================
  { id: 'management-cards', type: 'card', variant: 'medium', page: 'ManagementRoot', parentLevel: 0, isChildren: false, description: 'Cartes des modules' },

  // ============================================================
  // BOUTIQUE
  // ============================================================
  { id: 'boutique-products', type: 'card', variant: 'default', page: 'BoutiquePage', parentLevel: 0, isChildren: false, description: 'Produits en vitrine' },
  { id: 'boutique-panier', type: 'card', variant: 'default', page: 'PanierPage', parentLevel: 0, isChildren: false, description: 'Panier' },

  // CONTENEURS ET SOUS-VUES UNIVERSELS
  { id: 'management-layout', type: 'page', variant: 'management', page: 'ManagementLayout', parentLevel: 0, isChildren: false, filePath: 'src/pages/management/ManagementLayout.tsx', description: 'Disposition principale de la gestion' },
  { id: 'messages-detail-loading', type: 'state', variant: 'loading', page: 'MessageDetail', parentLevel: 0, isChildren: false, filePath: 'src/pages/messages/MessageDetail.tsx', description: 'Chargement de la conversation' },
  { id: 'messages-detail-empty', type: 'state', variant: 'empty', page: 'MessageDetail', parentLevel: 0, isChildren: false, filePath: 'src/pages/messages/MessageDetail.tsx', description: 'Conversation vide' },
  { id: 'messages-detail', type: 'panel', variant: 'conversation', page: 'MessageDetail', parentLevel: 0, isChildren: false, filePath: 'src/pages/messages/MessageDetail.tsx', description: 'Détail de la conversation' },
  { id: 'messages-list-loading', type: 'state', variant: 'loading', page: 'MessageList', parentLevel: 0, isChildren: false, filePath: 'src/pages/messages/MessageList.tsx', description: 'Chargement des conversations' },
  { id: 'messages-list-empty', type: 'state', variant: 'empty', page: 'MessageList', parentLevel: 0, isChildren: false, filePath: 'src/pages/messages/MessageList.tsx', description: 'Liste de conversations vide' },
  { id: 'messages-list', type: 'list', variant: 'conversations', page: 'MessageList', parentLevel: 0, isChildren: false, filePath: 'src/pages/messages/MessageList.tsx', description: 'Liste des conversations' },
  { id: 'stocks-product-filters', type: 'filters', variant: 'products', page: 'StocksPage', parentLevel: 1, isChildren: true, filePath: 'src/pages/stocks/ProductFilters.tsx', description: 'Filtres des produits' },
  { id: 'stocks-stock-indicator', type: 'indicator', variant: 'available', page: 'StocksPage', parentLevel: 2, isChildren: true, filePath: 'src/pages/stocks/StockIndicator.tsx', description: 'Indicateur de stock disponible' },
  { id: 'stocks-stock-indicator-low', type: 'indicator', variant: 'low', page: 'StocksPage', parentLevel: 2, isChildren: true, filePath: 'src/pages/stocks/StockIndicator.tsx', description: 'Indicateur de stock bas' },
  { id: 'stocks-stock-indicator-out', type: 'indicator', variant: 'out', page: 'StocksPage', parentLevel: 2, isChildren: true, filePath: 'src/pages/stocks/StockIndicator.tsx', description: 'Indicateur de rupture' },
  { id: 'animation-editor-preview', type: 'preview', variant: 'dynamic', page: 'AnimationEditorPage', parentLevel: 1, isChildren: true, filePath: 'src/pages/admin/AnimationEditorPage.tsx', description: 'Aperçu du composant animé' },
];

// ============================================================
// HELPERS
// ============================================================

export function getMotionBoxUsagesByPage(page: string): MotionBoxUsage[] {
  return MOTIONBOX_USAGES.filter((usage: MotionBoxUsage) => usage.page === page);
}

export function getMotionBoxUsageById(id: string): MotionBoxUsage | undefined {
  return MOTIONBOX_USAGES.find((usage: MotionBoxUsage) => usage.id === id);
}

export function getAllPages(): string[] {
  const pages = new Set(MOTIONBOX_USAGES.map((usage: MotionBoxUsage) => usage.page));
  return Array.from(pages).sort();
}

export function getMotionBoxUsagesByType(type: string): MotionBoxUsage[] {
  return MOTIONBOX_USAGES.filter((usage: MotionBoxUsage) => usage.type === type);
}

export function searchMotionBoxUsages(query: string): MotionBoxUsage[] {
  const q = query.toLowerCase();
  return MOTIONBOX_USAGES.filter(
    (usage: MotionBoxUsage) =>
      usage.id.toLowerCase().includes(q) ||
      usage.type.toLowerCase().includes(q) ||
      (usage.variant && usage.variant.toLowerCase().includes(q)) ||
      usage.page.toLowerCase().includes(q) ||
      (usage.description && usage.description.toLowerCase().includes(q))
  );
}

export default MOTIONBOX_USAGES;
