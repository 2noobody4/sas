// ============================================================
// NAVBAR REGISTRY — Registre des styles de navigation
// Version V3 — Compatible React 16
// ============================================================

import type { ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================

export type NavbarStyle = 
  | "classic"
  | "dark"
  | "floating"
  | "minimal"
  | "gradient"
  | "glass";

export interface NavbarDefinition {
  /** Identifiant unique du style */
  id: NavbarStyle;
  /** Nom affiché dans l'UI */
  nom: string;
  /** Description du style */
  description: string;
  /** Styles CSS du conteneur */
  containerStyle: React.CSSProperties;
  /** Couleur des icônes inactives */
  iconColor: string;
  /** Couleur des icônes actives */
  iconActiveColor: string;
  /** Couleur des labels inactifs */
  labelColor: string;
  /** Couleur des labels actifs */
  labelActiveColor: string;
  /** Couleur de l'indicateur */
  indicatorColor: string;
  /** Afficher les labels ? */
  showLabel: boolean;
  /** Classes CSS supplémentaires */
  containerClassName?: string;
  /** Composant de rendu personnalisé (optionnel) */
  render?: (props: any) => ReactNode;
}

// ============================================================
// REGISTRE DES STYLES
// ============================================================

export const NAVBAR_REGISTRY: Record<NavbarStyle, NavbarDefinition> = {
  // ============================================================
  // CLASSIC — Style par défaut
  // ============================================================
  classic: {
    id: "classic",
    nom: "Classique",
    description: "Style classique avec fond blanc et bordure",
    containerStyle: {
      backgroundColor: "#FFFFFF",
      borderTop: "1px solid #E2E6EA",
    },
    containerClassName: "border-t border-gray-200",
    iconColor: "#5B6672",
    iconActiveColor: "#1E3A5F",
    labelColor: "#5B6672",
    labelActiveColor: "#1E3A5F",
    indicatorColor: "#E8A33D",
    showLabel: true,
  },

  // ============================================================
  // DARK — Style sombre
  // ============================================================
  dark: {
    id: "dark",
    nom: "Sombre",
    description: "Style sombre avec fond noir",
    containerStyle: {
      backgroundColor: "#1A1A2E",
      borderTop: "1px solid #2D2D44",
    },
    containerClassName: "border-t border-gray-800",
    iconColor: "#6B6B8A",
    iconActiveColor: "#E8A33D",
    labelColor: "#6B6B8A",
    labelActiveColor: "#E8A33D",
    indicatorColor: "#E8A33D",
    showLabel: true,
  },

  // ============================================================
  // FLOATING — Style flottant (glassmorphism)
  // ============================================================
  floating: {
    id: "floating",
    nom: "Flottant",
    description: "Style flottant avec effet glassmorphism",
    containerStyle: {
      backgroundColor: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
      borderRadius: "24px",
      margin: "8px 16px",
      boxShadow: "0 8px 32px rgba(18,24,31,0.12)",
      border: "1px solid rgba(255,255,255,0.3)",
    },
    containerClassName: "rounded-2xl shadow-lg mx-4 mb-2",
    iconColor: "#5B6672",
    iconActiveColor: "#6C5CE7",
    labelColor: "#5B6672",
    labelActiveColor: "#6C5CE7",
    indicatorColor: "#6C5CE7",
    showLabel: true,
  },

  // ============================================================
  // MINIMAL — Style minimaliste (sans labels)
  // ============================================================
  minimal: {
    id: "minimal",
    nom: "Minimaliste",
    description: "Style minimaliste sans labels",
    containerStyle: {
      backgroundColor: "#FFFFFF",
      borderTop: "1px solid #EEF0F3",
      padding: "8px 0",
    },
    containerClassName: "border-t border-gray-100 py-2",
    iconColor: "#ADB5BD",
    iconActiveColor: "#1E3A5F",
    labelColor: "#ADB5BD",
    labelActiveColor: "#1E3A5F",
    indicatorColor: "#1E3A5F",
    showLabel: false,
  },

  // ============================================================
  // GRADIENT — Style avec dégradé
  // ============================================================
  gradient: {
    id: "gradient",
    nom: "Dégradé",
    description: "Style avec dégradé de couleurs",
    containerStyle: {
      background: "linear-gradient(135deg, #1E3A5F 0%, #6C5CE7 100%)",
      borderTop: "none",
      boxShadow: "0 -4px 20px rgba(30,58,95,0.3)",
    },
    containerClassName: "shadow-lg",
    iconColor: "rgba(255,255,255,0.6)",
    iconActiveColor: "#FFFFFF",
    labelColor: "rgba(255,255,255,0.6)",
    labelActiveColor: "#FFFFFF",
    indicatorColor: "#FFFFFF",
    showLabel: true,
  },

  // ============================================================
  // GLASS — Style verre (transparent)
  // ============================================================
  glass: {
    id: "glass",
    nom: "Verre",
    description: "Style transparent avec effet verre",
    containerStyle: {
      backgroundColor: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 -4px 30px rgba(0,0,0,0.05)",
    },
    containerClassName: "backdrop-blur-xl",
    iconColor: "rgba(255,255,255,0.7)",
    iconActiveColor: "#FFFFFF",
    labelColor: "rgba(255,255,255,0.7)",
    labelActiveColor: "#FFFFFF",
    indicatorColor: "#E8A33D",
    showLabel: true,
  },
};

// ============================================================
// HELPERS
// ============================================================

export function getNavbarStyle(id: NavbarStyle): NavbarDefinition | undefined {
  return NAVBAR_REGISTRY[id];
}

export function getNavbarStyles(): NavbarDefinition[] {
  return Object.values(NAVBAR_REGISTRY);
}

export function getNavbarStyleNames(): NavbarStyle[] {
  return Object.keys(NAVBAR_REGISTRY) as NavbarStyle[];
}

export function searchNavbarStyles(query: string): NavbarDefinition[] {
  const q = query.toLowerCase();
  return Object.values(NAVBAR_REGISTRY).filter(
    (style) =>
      style.id.toLowerCase().includes(q) ||
      style.nom.toLowerCase().includes(q) ||
      style.description.toLowerCase().includes(q)
  );
}

export default NAVBAR_REGISTRY;
