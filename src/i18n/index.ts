import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      // Commun
      home: 'Accueil',
      login: 'Se connecter',
      logout: 'Se déconnecter',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      search: 'Rechercher...',
      search_placeholder: 'Rechercher...',
      email: 'Email',
      password: 'Mot de passe',
      name: 'Nom',
      first_name: 'Prénom',
      phone: 'Téléphone',
      address: 'Adresse',
      description: 'Description',
      title: 'Titre',
      status: 'Statut',
      actions: 'Actions',
      loading: 'Chargement...',
      no_data: 'Aucune donnée',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
      close: 'Fermer',
      yes: 'Oui',
      no: 'Non',
      all: 'Tous',
      published: 'Publié',
      draft: 'Brouillon',
      menu: 'Menu',
      notifications: 'Notifications',
      profile: 'Profil',

      // Navigation
      nav_home: 'Accueil',
      nav_products: 'Produits',
      nav_stock: 'Stock',
      nav_cash: 'Caisse',
      nav_accounting: 'Comptabilité',
      nav_hr: 'RH',
      nav_shop: 'Boutique',
      nav_messages: 'Messages',
      nav_clients: 'Clients',
      nav_profile: 'Profil',
      nav_settings: 'Paramètres',
      nav_pages: 'Pages',
      nav_gestion: 'Gestion',

      // Layouts
      layout_default: 'Défaut',
      layout_full: 'Plein écran',
      layout_sidebar: 'Avec sidebar',

      // Thème
      theme_editor: 'Éditeur de thème',
      colors: 'Couleurs',
      typography: 'Typographie',
      components: 'Composants',
      preview: 'Aperçu',
      color_palette_description: 'Personnalisez la palette de couleurs de votre application',
      typography_description: 'Personnalisez la typographie de votre application',
      components_description: 'Personnalisez le style de chaque type de composant',
      preview_description: 'Aperçu en direct des modifications',

      // Animations
      animation_editor: 'Éditeur d\'animations',
      entrance: 'Entrée',
      exit: 'Sortie',
      interaction: 'Interaction',
      select_component: 'Sélectionner un composant',
      test_animation: 'Tester l\'animation',

      // Authentification
      login_title: 'Connexion',
      register_title: 'Inscription',
      forgot_password: 'Mot de passe oublié ?',
      register_link: 'Créer un compte',
      login_link: 'Déjà un compte ? Se connecter',
      password_placeholder: '••••••••',
      email_placeholder: 'exemple@email.com',
    },
  },
  en: {
    translation: {
      // Common
      home: 'Home',
      login: 'Login',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search...',
      search_placeholder: 'Search...',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      first_name: 'First Name',
      phone: 'Phone',
      address: 'Address',
      description: 'Description',
      title: 'Title',
      status: 'Status',
      actions: 'Actions',
      loading: 'Loading...',
      no_data: 'No data',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      published: 'Published',
      draft: 'Draft',
      menu: 'Menu',
      notifications: 'Notifications',
      profile: 'Profile',

      // Navigation
      nav_home: 'Home',
      nav_products: 'Products',
      nav_stock: 'Stock',
      nav_cash: 'Cash',
      nav_accounting: 'Accounting',
      nav_hr: 'HR',
      nav_shop: 'Shop',
      nav_messages: 'Messages',
      nav_clients: 'Clients',
      nav_profile: 'Profile',
      nav_settings: 'Settings',
      nav_pages: 'Pages',
      nav_gestion: 'Management',

      // Layouts
      layout_default: 'Default',
      layout_full: 'Full Screen',
      layout_sidebar: 'With Sidebar',

      // Theme
      theme_editor: 'Theme Editor',
      colors: 'Colors',
      typography: 'Typography',
      components: 'Components',
      preview: 'Preview',
      color_palette_description: 'Customize your application color palette',
      typography_description: 'Customize your application typography',
      components_description: 'Customize each component type style',
      preview_description: 'Live preview of changes',

      // Animations
      animation_editor: 'Animation Editor',
      entrance: 'Entrance',
      exit: 'Exit',
      interaction: 'Interaction',
      select_component: 'Select a component',
      test_animation: 'Test animation',

      // Authentication
      login_title: 'Login',
      register_title: 'Register',
      forgot_password: 'Forgot password?',
      register_link: 'Create an account',
      login_link: 'Already have an account? Login',
      password_placeholder: '••••••••',
      email_placeholder: 'example@email.com',
    },
  },
};

// ============================================================
// LANGUES SUPPORTÉES
// ============================================================
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',

    // Restreindre aux langues supportées
    supportedLngs: SUPPORTED_LANGUAGES,

    // 'fr-FR' → 'fr', 'en-US' → 'en'
    load: 'languageOnly',

    // Si la clé n'existe pas, on retourne la clé elle-même
    returnNull: false,

    // Affiche les warnings i18next uniquement en dev
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React échappe déjà
    },

    detection: {
      // Ordre de détection : localStorage > navigator > html tag
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Clé utilisée dans localStorage
      lookupLocalStorage: 'app-pme-lang',
      // Cache la langue détectée
      caches: ['localStorage'],
    },

    react: {
      // Recharger les composants lors du changement de langue
      useSuspense: true,
    },
  });

export default i18n;
