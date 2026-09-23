// ============================================================
// LUCIDE REGISTRY — Icônes + alias pour icônes obsolètes
// Version V3.1 — Compatible React 16
// ============================================================

import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LucideIconItem {
  id: string;
  label: string;
  category: string;
  keywords: string[];
}

export type LucideIconCategory =
  | 'Navigation' | 'Actions' | 'Statut' | 'Communication' | 'Fichiers'
  | 'Utilitaires' | 'Finances' | 'Média' | 'Gestion' | 'Layout';

export const LUCIDE_ICON_LIST: LucideIconItem[] = [
  { id: 'Home', label: 'Accueil', category: 'Navigation', keywords: ['maison', 'début', 'dashboard'] },
  { id: 'Search', label: 'Rechercher', category: 'Navigation', keywords: ['loupe', 'trouver', 'filtre'] },
  { id: 'Menu', label: 'Menu', category: 'Navigation', keywords: ['hamburger', 'liste', 'navigation'] },
  { id: 'ArrowLeft', label: 'Flèche gauche', category: 'Navigation', keywords: ['retour', 'précédent'] },
  { id: 'ArrowRight', label: 'Flèche droite', category: 'Navigation', keywords: ['suivant', 'avancer'] },
  { id: 'ArrowUp', label: 'Flèche haut', category: 'Navigation', keywords: ['monter', 'top'] },
  { id: 'ArrowDown', label: 'Flèche bas', category: 'Navigation', keywords: ['descendre', 'bas'] },
  { id: 'ChevronRight', label: 'Chevron droit', category: 'Navigation', keywords: ['déplier', 'suite'] },
  { id: 'Plus', label: 'Ajouter', category: 'Actions', keywords: ['nouveau', 'créer', 'ajout'] },
  { id: 'Minus', label: 'Retirer', category: 'Actions', keywords: ['supprimer', 'moins'] },
  { id: 'X', label: 'Fermer', category: 'Actions', keywords: ['croix', 'annuler', 'fermer'] },
  { id: 'Check', label: 'Valider', category: 'Actions', keywords: ['check', 'ok', 'confirmer'] },
  { id: 'Edit', label: 'Modifier', category: 'Actions', keywords: ['éditer', 'crayon', 'changer'] },
  { id: 'Trash2', label: 'Supprimer', category: 'Actions', keywords: ['poubelle', 'effacer', 'corbeille'] },
  { id: 'Save', label: 'Sauvegarder', category: 'Actions', keywords: ['disquette', 'enregistrer'] },
  { id: 'Download', label: 'Télécharger', category: 'Actions', keywords: ['sauver', 'exporter'] },
  { id: 'Upload', label: 'Téléverser', category: 'Actions', keywords: ['importer', 'envoyer'] },
  { id: 'Copy', label: 'Copier', category: 'Actions', keywords: ['dupliquer', 'clone'] },
  { id: 'FilePlus', label: 'Ajouter fichier', category: 'Actions', keywords: ['créer', 'document'] },
  { id: 'AlertCircle', label: 'Alerte', category: 'Statut', keywords: ['erreur', 'attention', 'danger'] },
  { id: 'AlertTriangle', label: 'Avertissement', category: 'Statut', keywords: ['warning', 'prudence'] },
  { id: 'CheckCircle', label: 'Succès', category: 'Statut', keywords: ['validé', 'confirmé', 'ok'] },
  { id: 'XCircle', label: 'Échec', category: 'Statut', keywords: ['refusé', 'invalide', 'erreur'] },
  { id: 'Info', label: 'Information', category: 'Statut', keywords: ['i', 'détail', 'aide'] },
  { id: 'HelpCircle', label: 'Aide', category: 'Statut', keywords: ['question', 'support', '?'] },
  { id: 'Bell', label: 'Notification', category: 'Statut', keywords: ['alerte', 'sonnerie', 'news'] },
  { id: 'Shield', label: 'Sécurité', category: 'Statut', keywords: ['protection', 'sûr', 'verrou'] },
  { id: 'Lock', label: 'Verrouillé', category: 'Statut', keywords: ['privé', 'sécurisé', 'fermé'] },
  { id: 'Unlock', label: 'Déverrouillé', category: 'Statut', keywords: ['ouvert', 'public', 'accès'] },
  { id: 'Mail', label: 'Email', category: 'Communication', keywords: ['courriel', 'message', 'lettre'] },
  { id: 'MessageSquare', label: 'Message', category: 'Communication', keywords: ['chat', 'discussion', 'bulle'] },
  { id: 'Phone', label: 'Téléphone', category: 'Communication', keywords: ['appel', 'contact', 'joindre'] },
  { id: 'Send', label: 'Envoyer', category: 'Communication', keywords: ['expédier', 'transmettre'] },
  { id: 'Share2', label: 'Partager', category: 'Communication', keywords: ['diffuser', 'réseau', 'lien'] },
  { id: 'Link', label: 'Lien', category: 'Communication', keywords: ['url', 'attache', 'chaîne'] },
  { id: 'FileText', label: 'Document', category: 'Fichiers', keywords: ['fichier', 'page', 'contrat'] },
  { id: 'Image', label: 'Image', category: 'Fichiers', keywords: ['photo', 'visuel', 'média'] },
  { id: 'Folder', label: 'Dossier', category: 'Fichiers', keywords: ['répertoire', 'classeur'] },
  { id: 'Paperclip', label: 'Pièce jointe', category: 'Fichiers', keywords: ['attache', 'fichier joint'] },
  { id: 'Calendar', label: 'Calendrier', category: 'Fichiers', keywords: ['date', 'agenda', 'rdv'] },
  { id: 'Clock', label: 'Horloge', category: 'Fichiers', keywords: ['temps', 'heure', 'historique'] },
  { id: 'User', label: 'Utilisateur', category: 'Utilitaires', keywords: ['personne', 'profil', 'compte'] },
  { id: 'Users', label: 'Groupe', category: 'Utilitaires', keywords: ['équipe', 'clients', 'collaborateurs'] },
  { id: 'UserPlus', label: 'Ajouter utilisateur', category: 'Utilitaires', keywords: ['nouveau', 'inscription'] },
  { id: 'UserCog', label: 'Gérer utilisateur', category: 'Utilitaires', keywords: ['modifier', 'config'] },
  { id: 'Star', label: 'Favori', category: 'Utilitaires', keywords: ['étoile', 'notation', 'bookmark'] },
  { id: 'Heart', label: 'J\'aime', category: 'Utilitaires', keywords: ['favori', 'aimer', 'like'] },
  { id: 'MapPin', label: 'Localisation', category: 'Utilitaires', keywords: ['gps', 'adresse', 'lieu'] },
  { id: 'Settings', label: 'Paramètres', category: 'Utilitaires', keywords: ['réglages', 'config', 'options'] },
  { id: 'Filter', label: 'Filtrer', category: 'Utilitaires', keywords: ['tri', 'sélection', 'catégorie'] },
  { id: 'SlidersHorizontal', label: 'Réglages fins', category: 'Utilitaires', keywords: ['filtres', 'ajustement'] },
  { id: 'Eye', label: 'Visible', category: 'Utilitaires', keywords: ['voir', 'afficher', 'aperçu'] },
  { id: 'EyeOff', label: 'Masqué', category: 'Utilitaires', keywords: ['caché', 'invisible', 'privé'] },
  { id: 'DollarSign', label: 'Dollar', category: 'Finances', keywords: ['argent', 'prix', 'devise'] },
  { id: 'CircleDollarSign', label: 'Dollar cerclé', category: 'Finances', keywords: ['caisse', 'argent'] },
  { id: 'Euro', label: 'Euro', category: 'Finances', keywords: ['devise', 'argent'] },
  { id: 'CreditCard', label: 'Carte bancaire', category: 'Finances', keywords: ['paiement', 'banque'] },
  { id: 'Receipt', label: 'Reçu', category: 'Finances', keywords: ['facture', 'ticket'] },
  { id: 'LayoutDashboard', label: 'Tableau de bord', category: 'Gestion', keywords: ['dashboard', 'gestion'] },
  { id: 'Package', label: 'Colis', category: 'Gestion', keywords: ['produit', 'stock', 'emballage'] },
  { id: 'PackagePlus', label: 'Ajouter colis', category: 'Gestion', keywords: ['nouveau produit', 'stock'] },
  { id: 'PackageOpen', label: 'Ouvrir colis', category: 'Gestion', keywords: ['produit', 'stock'] },
  { id: 'Warehouse', label: 'Entrepôt', category: 'Gestion', keywords: ['stock', 'entrepôt'] },
  { id: 'Store', label: 'Magasin', category: 'Gestion', keywords: ['boutique', 'commerce'] },
  { id: 'BarChart', label: 'Graphique', category: 'Gestion', keywords: ['statistiques', 'rapport'] },
  { id: 'ShoppingBag', label: 'Sac de courses', category: 'Gestion', keywords: ['boutique', 'achat'] },
  { id: 'ShoppingCart', label: 'Panier', category: 'Gestion', keywords: ['panier', 'commande'] },
  { id: 'Truck', label: 'Camion', category: 'Gestion', keywords: ['commande', 'livraison'] },
  { id: 'Layers', label: 'Calques', category: 'Gestion', keywords: ['composants', 'structure'] },
  { id: 'Palette', label: 'Palette', category: 'Gestion', keywords: ['couleur', 'thème'] },
  { id: 'FolderTree', label: 'Arborescence', category: 'Gestion', keywords: ['catégories', 'dossiers'] },
  { id: 'GitBranch', label: 'Branche', category: 'Gestion', keywords: ['mouvement', 'flux'] },
  { id: 'ClipboardList', label: 'Liste', category: 'Gestion', keywords: ['inventaire', 'checklist'] },
  { id: 'Camera', label: 'Appareil photo', category: 'Média', keywords: ['photo', 'capture'] },
  { id: 'Video', label: 'Vidéo', category: 'Média', keywords: ['film', 'enregistrement'] },
  { id: 'Coins', label: 'Pièces', category: 'Finances', keywords: ['caisse', 'argent'] },
];

// ============================================================
// ALIAS — Icônes obsolètes → icônes valides
// ============================================================
const ICON_ALIASES: Record<string, string> = {
  PackageEdit: 'Edit',
  UserEdit: 'UserCog',
};

export function resolveLucideIcon(nom: string): LucideIcon {
  // 1. Chercher un alias
  const resolvedName = ICON_ALIASES[nom] || nom;
  const icon = (Icons as unknown as Record<string, LucideIcon>)[resolvedName];

  if (!icon) {
    // Éviter de polluer la console : warning une seule fois par icône manquante
    const warned = (resolveLucideIcon as any)._warned || {};
    if (!warned[nom]) {
      console.warn(`[LucideRegistry] Icône inconnue: "${nom}" — fallback sur Circle`);
      warned[nom] = true;
      (resolveLucideIcon as any)._warned = warned;
    }
    return Icons.Circle;
  }
  return icon;
}

export function isValidIcon(nom: string): boolean {
  return LUCIDE_ICON_LIST.some((item) => item.id === nom);
}

export function getIconsByCategory(category: string): LucideIconItem[] {
  return LUCIDE_ICON_LIST.filter((item) => item.category === category);
}

export function searchIcons(query: string): LucideIconItem[] {
  const q = query.toLowerCase();
  return LUCIDE_ICON_LIST.filter(
    (item) =>
      item.id.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
  );
}
