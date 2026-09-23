// ============================================================
// SERVICES — Point d'export
// Version V3 — Retrait de ServiceFormPage
// ============================================================

export { ServicesRoot } from './ServicesRoot';
export { ServicesAdminPage } from './ServicesAdminPage';
export { ServicesCategoriesPage } from './ServicesCategoriesPage';
export { DemandesServicePage } from './DemandesServicePage';
export { CommanderServicePage } from './CommanderServicePage';
export { MesDemandesServicePage } from './MesDemandesServicePage';

// Détail admin ET public : deux noms distincts
export { ServiceDetailPage as ServiceDetailAdminPage } from './ServicesServiceDetailPage';
export { default as ServiceDetailPublicPage } from './BoutiqueServiceDetailPage';
