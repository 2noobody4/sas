// ============================================================
// MOTIONBOX USAGES — Registre des composants par page
// Version V3.1 — Enrichi manuellement + fallback auto
// ------------------------------------------------------------
// Chaque entrée : { id, type, variant, page, parentLevel, isChildren }
// Le "page" doit correspondre au nom de fichier sans extension.
// ============================================================

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

export const MOTIONBOX_USAGES: MotionBoxUsage[] = [
  // ---- App ----
  { id: 'app-page', type: 'page', variant: 'default', page: 'Application', parentLevel: 0, isChildren: false },

  // ---- HomePage ----
  { id: 'home-hero', type: 'card', variant: 'large', page: 'HomePage', parentLevel: 0, isChildren: false },
  { id: 'home-features', type: 'card', variant: 'medium', page: 'HomePage', parentLevel: 0, isChildren: false },
  { id: 'home-products', type: 'card', variant: 'default', page: 'HomePage', parentLevel: 0, isChildren: false },
  { id: 'home-cta', type: 'card', variant: 'large', page: 'HomePage', parentLevel: 0, isChildren: false },
  { id: 'home-banner', type: 'card', variant: 'default', page: 'HomePage', parentLevel: 0, isChildren: false },

  // ---- DashboardRoot ----
  { id: 'dashboard-stats', type: 'card', variant: 'medium', page: 'DashboardRoot', parentLevel: 0, isChildren: false },
  { id: 'dashboard-history', type: 'card', variant: 'default', page: 'DashboardRoot', parentLevel: 0, isChildren: false },

  // ---- Stocks ----
  { id: 'stocks-list', type: 'card', variant: 'elevated', page: 'StocksPage', parentLevel: 0, isChildren: false },
  { id: 'stocks-product-filters', type: 'filters', variant: 'products', page: 'StocksPage', parentLevel: 1, isChildren: true },
  { id: 'stocks-stock-indicator', type: 'indicator', variant: 'available', page: 'StocksPage', parentLevel: 2, isChildren: true },
  { id: 'stocks-stock-indicator-low', type: 'indicator', variant: 'low', page: 'StocksPage', parentLevel: 2, isChildren: true },
  { id: 'stocks-stock-indicator-out', type: 'indicator', variant: 'out', page: 'StocksPage', parentLevel: 2, isChildren: true },
  { id: 'product-form-card', type: 'card', variant: 'xlarge', page: 'ProductFormPage', parentLevel: 0, isChildren: false },
  { id: 'stock-dashboard-stats', type: 'card', variant: 'default', page: 'StockDashboard', parentLevel: 0, isChildren: false },
  { id: 'stock-dashboard-cards', type: 'card', variant: 'elevated', page: 'StockDashboard', parentLevel: 0, isChildren: false },
  { id: 'produit-root-cards', type: 'card', variant: 'medium', page: 'ProduitRoot', parentLevel: 0, isChildren: false },
  { id: 'categories-list', type: 'card', variant: 'default', page: 'CategoriesPage', parentLevel: 0, isChildren: false },
  { id: 'fournisseurs-list', type: 'card', variant: 'default', page: 'FournisseursPage', parentLevel: 0, isChildren: false },
  { id: 'mouvements-list', type: 'card', variant: 'elevated', page: 'MouvementsPage', parentLevel: 0, isChildren: false },
  { id: 'inventaire-home-cards', type: 'card', variant: 'medium', page: 'InventaireHome', parentLevel: 0, isChildren: false },
  { id: 'inventaire-sessions', type: 'card', variant: 'elevated', page: 'SessionsInventairePage', parentLevel: 0, isChildren: false },
  { id: 'inventaire-controle', type: 'card', variant: 'elevated', page: 'ControleInventairePage', parentLevel: 0, isChildren: false },
  { id: 'inventaire-rapport', type: 'card', variant: 'default', page: 'RapportInventairePage', parentLevel: 0, isChildren: false },

  // ---- Caisse ----
  { id: 'caisse-root-cards', type: 'card', variant: 'medium', page: 'CaisseRoot', parentLevel: 0, isChildren: false },
  { id: 'caisse-sessions', type: 'card', variant: 'elevated', page: 'SessionsPage', parentLevel: 0, isChildren: false },
  { id: 'caisse-sessions-caisse', type: 'card', variant: 'elevated', page: 'SessionsCaissePage', parentLevel: 0, isChildren: false },
  { id: 'caisse-ventes', type: 'card', variant: 'elevated', page: 'VentesPage', parentLevel: 0, isChildren: false },
  { id: 'caisse-vente-form', type: 'card', variant: 'default', page: 'VenteFormPage', parentLevel: 0, isChildren: false },
  { id: 'caisse-rapports', type: 'card', variant: 'default', page: 'CaisseRapportsPage', parentLevel: 0, isChildren: false },
  { id: 'negociation-list', type: 'card', variant: 'elevated', page: 'NegociationPage', parentLevel: 0, isChildren: false },

  // ---- Clients ----
  { id: 'clients-root-cards', type: 'card', variant: 'medium', page: 'ClientsRoot', parentLevel: 0, isChildren: false },
  { id: 'clients-list', type: 'card', variant: 'elevated', page: 'ClientsPage', parentLevel: 0, isChildren: false },
  { id: 'clients-detail', type: 'card', variant: 'elevated', page: 'ClientDetailPage', parentLevel: 0, isChildren: false },
  { id: 'clients-form', type: 'card', variant: 'elevated', page: 'ClientFormPage', parentLevel: 0, isChildren: false },
  { id: 'clients-rapports', type: 'card', variant: 'default', page: 'ClientsRapportsPage', parentLevel: 0, isChildren: false },
  { id: 'fidelite-cards', type: 'card', variant: 'default', page: 'FidelitePage', parentLevel: 0, isChildren: false },
  { id: 'interactions-list', type: 'card', variant: 'elevated', page: 'InteractionsPage', parentLevel: 0, isChildren: false },
  { id: 'commandes-client', type: 'card', variant: 'elevated', page: 'CommandesClientPage', parentLevel: 0, isChildren: false },
  { id: 'commande-client-detail', type: 'card', variant: 'elevated', page: 'CommandeClientDetailPage', parentLevel: 0, isChildren: false },
  { id: 'commande-client-form', type: 'card', variant: 'default', page: 'CommandeClientFormPage', parentLevel: 0, isChildren: false },

  // ---- Comptabilité ----
  { id: 'compta-root-cards', type: 'card', variant: 'medium', page: 'ComptabiliteRoot', parentLevel: 0, isChildren: false },
  { id: 'compta-journal', type: 'card', variant: 'elevated', page: 'JournalPage', parentLevel: 0, isChildren: false },
  { id: 'compta-bilan', type: 'card', variant: 'elevated', page: 'BilanPage', parentLevel: 0, isChildren: false },
  { id: 'compta-resultat', type: 'card', variant: 'elevated', page: 'CompteResultatPage', parentLevel: 0, isChildren: false },
  { id: 'compta-grand-livre', type: 'card', variant: 'elevated', page: 'GrandLivrePage', parentLevel: 0, isChildren: false },
  { id: 'compta-tva', type: 'card', variant: 'elevated', page: 'TvaPage', parentLevel: 0, isChildren: false },
  { id: 'compta-transactions', type: 'card', variant: 'elevated', page: 'TransactionsPage', parentLevel: 0, isChildren: false },
  { id: 'compta-plan-comptable', type: 'card', variant: 'default', page: 'PlanComptablePage', parentLevel: 0, isChildren: false },
  { id: 'compta-saisie', type: 'card', variant: 'default', page: 'SaisieComptable', parentLevel: 0, isChildren: false },
  { id: 'compta-factures', type: 'card', variant: 'elevated', page: 'FacturesPage', parentLevel: 0, isChildren: false },
  { id: 'compta-facture-form', type: 'card', variant: 'elevated', page: 'FactureFormPage', parentLevel: 0, isChildren: false },
  { id: 'compta-rappels', type: 'card', variant: 'default', page: 'RappelsPage', parentLevel: 0, isChildren: false },
  { id: 'compta-charges', type: 'card', variant: 'elevated', page: 'ChargesPage', parentLevel: 0, isChildren: false },
  { id: 'compta-charge-form', type: 'card', variant: 'elevated', page: 'ChargeFormPage', parentLevel: 0, isChildren: false },
  { id: 'compta-charges-usuelles', type: 'card', variant: 'elevated', page: 'ChargesUsuellesPage', parentLevel: 0, isChildren: false },
  { id: 'compta-sessions-caisse', type: 'card', variant: 'elevated', page: 'SessionsCaissePage', parentLevel: 0, isChildren: false },

  // ---- RH ----
  { id: 'rh-root-cards', type: 'card', variant: 'medium', page: 'RHPage', parentLevel: 0, isChildren: false },
  { id: 'rh-employes', type: 'card', variant: 'elevated', page: 'EmployesPage', parentLevel: 0, isChildren: false },
  { id: 'rh-employe-form', type: 'card', variant: 'elevated', page: 'EmployeFormPage', parentLevel: 0, isChildren: false },
  { id: 'rh-contrats', type: 'card', variant: 'elevated', page: 'ContratsPage', parentLevel: 0, isChildren: false },
  { id: 'rh-conges', type: 'card', variant: 'elevated', page: 'CongesPage', parentLevel: 0, isChildren: false },
  { id: 'rh-fiches-paie', type: 'card', variant: 'elevated', page: 'FichesPaiePage', parentLevel: 0, isChildren: false },
  { id: 'rh-pointages', type: 'card', variant: 'elevated', page: 'PointagesPage', parentLevel: 0, isChildren: false },
  { id: 'rh-demandes-absence', type: 'card', variant: 'elevated', page: 'DemandesAbsencePage', parentLevel: 0, isChildren: false },

  // ---- Entrepôts / Magasins ----
  { id: 'entrepots-list', type: 'card', variant: 'default', page: 'EntrepotsPage', parentLevel: 0, isChildren: false },
  { id: 'entrepot-form', type: 'card', variant: 'elevated', page: 'EntrepotFormPage', parentLevel: 0, isChildren: false },
  { id: 'entrepot-detail', type: 'card', variant: 'elevated', page: 'EntrepotDetailPage', parentLevel: 0, isChildren: false },
  { id: 'emplacements-list', type: 'card', variant: 'default', page: 'EmplacementsPage', parentLevel: 0, isChildren: false },
  { id: 'magasins-list', type: 'card', variant: 'default', page: 'MagasinsPage', parentLevel: 0, isChildren: false },
  { id: 'magasin-form', type: 'card', variant: 'elevated', page: 'MagasinFormPage', parentLevel: 0, isChildren: false },

  // ---- Boutique ----
  { id: 'boutique-products', type: 'card', variant: 'default', page: 'BoutiquePage', parentLevel: 0, isChildren: false },
  { id: 'panier-cards', type: 'card', variant: 'default', page: 'PanierPage', parentLevel: 0, isChildren: false },
  { id: 'boutique-commandes', type: 'card', variant: 'elevated', page: 'BoutiqueCommandesPage', parentLevel: 0, isChildren: false },
  { id: 'services-public', type: 'card', variant: 'default', page: 'ServicesPage', parentLevel: 0, isChildren: false },
  { id: 'service-form', type: 'card', variant: 'elevated', page: 'ServiceFormPage', parentLevel: 0, isChildren: false },
  { id: 'service-detail', type: 'card', variant: 'elevated', page: 'BoutiqueServiceDetailPage', parentLevel: 0, isChildren: false },

  // ---- Paramètres ----
  { id: 'settings-page', type: 'page', variant: 'default', page: 'SettingsPage', parentLevel: 0, isChildren: false },
  { id: 'settings-card', type: 'settings', variant: 'card', page: 'SettingsPage', parentLevel: 1, isChildren: true },
  { id: 'settings-section', type: 'settings', variant: 'section', page: 'SettingsPage', parentLevel: 1, isChildren: true },
  { id: 'settings-preview', type: 'settings', variant: 'preview', page: 'SettingsPage', parentLevel: 1, isChildren: true },

  // ---- Administration ----
  { id: 'management-cards', type: 'card', variant: 'medium', page: 'ManagementRoot', parentLevel: 0, isChildren: false },
  { id: 'management-layout', type: 'page', variant: 'management', page: 'ManagementLayout', parentLevel: 0, isChildren: false },
  { id: 'theme-editor-tabs', type: 'card', variant: 'large', page: 'ThemeEditorPage', parentLevel: 0, isChildren: false },
  { id: 'theme-editor-colors', type: 'card', variant: 'large', page: 'ThemeEditorColors', parentLevel: 0, isChildren: false },
  { id: 'theme-editor-typography', type: 'card', variant: 'large', page: 'ThemeEditorTypography', parentLevel: 0, isChildren: false },
  { id: 'theme-editor-components', type: 'card', variant: 'large', page: 'ThemeEditorComponents', parentLevel: 0, isChildren: false },
  { id: 'theme-editor-pages', type: 'card', variant: 'large', page: 'ThemeEditorPages', parentLevel: 0, isChildren: false },
  { id: 'animation-editor-preview', type: 'preview', variant: 'dynamic', page: 'AnimationEditorPage', parentLevel: 1, isChildren: true },
  { id: 'home-editor-blocks', type: 'card', variant: 'elevated', page: 'HomeEditorPage', parentLevel: 0, isChildren: false },
  { id: 'analytics-stats', type: 'card', variant: 'default', page: 'AnalyticsPage', parentLevel: 0, isChildren: false },
  { id: 'historique-table', type: 'card', variant: 'elevated', page: 'HistoriquePage', parentLevel: 0, isChildren: false },
  { id: 'demandes-list', type: 'card', variant: 'default', page: 'DemandesPage', parentLevel: 0, isChildren: false },
  { id: 'offline-queue', type: 'card', variant: 'elevated', page: 'OfflineQueuePage', parentLevel: 0, isChildren: false },
];

// ============================================================
// HELPERS
// ============================================================

export function getMotionBoxUsagesByPage(page: string): MotionBoxUsage[] {
  return MOTIONBOX_USAGES.filter((u) => u.page === page);
}

export function getMotionBoxUsageById(id: string): MotionBoxUsage | undefined {
  return MOTIONBOX_USAGES.find((u) => u.id === id);
}

export function getAllPages(): string[] {
  const pages = new Set(MOTIONBOX_USAGES.map((u) => u.page));
  return Array.from(pages).sort();
}

export function getMotionBoxUsagesByType(type: string): MotionBoxUsage[] {
  return MOTIONBOX_USAGES.filter((u) => u.type === type);
}

export function searchMotionBoxUsages(query: string): MotionBoxUsage[] {
  const q = query.toLowerCase();
  return MOTIONBOX_USAGES.filter(
    (u) =>
      u.id.toLowerCase().includes(q) ||
      u.type.toLowerCase().includes(q) ||
      (u.variant && u.variant.toLowerCase().includes(q)) ||
      u.page.toLowerCase().includes(q) ||
      (u.description && u.description.toLowerCase().includes(q))
  );
}

export default MOTIONBOX_USAGES;
