// ============================================================
// CSS PROPERTIES — Toutes les propriétés CSS disponibles
// Version V3 — Compatible React 16
// ============================================================

export type CSSValue = string | number | undefined;

// ============================================================
// TYPES DE BASE
// ============================================================

type Display = 
  | 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' 
  | 'grid' | 'inline-grid' | 'none' | 'contents';

type Position = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto';

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

type JustifyContent = 
  | 'flex-start' | 'center' | 'flex-end' 
  | 'space-between' | 'space-around' | 'space-evenly';

type TextAlign = 'left' | 'center' | 'right' | 'justify';

type FontWeight = 
  | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  | 'normal' | 'bold' | 'bolder' | 'lighter';

type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'none' | 'hidden';

// ============================================================
// INTERFACE COMPLÈTE
// ============================================================

export interface CSSProperties {
  // ============================================================
  // 1. DIMENSIONNEMENT
  // ============================================================
  width?: CSSValue;
  height?: CSSValue;
  minWidth?: CSSValue;
  maxWidth?: CSSValue;
  minHeight?: CSSValue;
  maxHeight?: CSSValue;
  aspectRatio?: CSSValue;
  boxSizing?: 'content-box' | 'border-box';

  // ============================================================
  // 2. ESPACEMENT
  // ============================================================
  padding?: CSSValue;
  paddingTop?: CSSValue;
  paddingBottom?: CSSValue;
  paddingLeft?: CSSValue;
  paddingRight?: CSSValue;
  margin?: CSSValue;
  marginTop?: CSSValue;
  marginBottom?: CSSValue;
  marginLeft?: CSSValue;
  marginRight?: CSSValue;
  gap?: CSSValue;
  rowGap?: CSSValue;
  columnGap?: CSSValue;

  // ============================================================
  // 3. COULEURS & FOND
  // ============================================================
  color?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  backgroundBlendMode?: 
    | 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' 
    | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' 
    | 'soft-light' | 'difference' | 'exclusion' | 'hue' 
    | 'saturation' | 'color' | 'luminosity';
  opacity?: number;

  // ============================================================
  // 4. TEXTE & TYPOGRAPHIE
  // ============================================================
  fontFamily?: string;
  fontSize?: CSSValue;
  fontWeight?: FontWeight;
  lineHeight?: CSSValue;
  letterSpacing?: CSSValue;
  wordSpacing?: CSSValue;
  textAlign?: TextAlign;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textShadow?: string;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  overflowWrap?: 'normal' | 'break-word';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: 'normal' | 'small-caps';

  // ============================================================
  // 5. POSITIONNEMENT
  // ============================================================
  position?: Position;
  top?: CSSValue;
  bottom?: CSSValue;
  left?: CSSValue;
  right?: CSSValue;
  zIndex?: number | string;
  inset?: CSSValue;
  visibility?: 'visible' | 'hidden' | 'collapse';
  cursor?: 
    | 'auto' | 'default' | 'pointer' | 'move' | 'text' | 'wait' 
    | 'not-allowed' | 'grab' | 'grabbing' | 'zoom-in' | 'zoom-out';
  pointerEvents?: 'auto' | 'none';
  userSelect?: 'auto' | 'none' | 'text' | 'all';

  // ============================================================
  // 6. OVERFLOW & DÉFILEMENT
  // ============================================================
  overflow?: Overflow;
  overflowX?: Overflow;
  overflowY?: Overflow;
  scrollBehavior?: 'auto' | 'smooth';
  scrollPadding?: CSSValue;
  scrollMargin?: CSSValue;
  overscrollBehavior?: 'auto' | 'contain' | 'none';

  // ============================================================
  // 7. FLEXBOX
  // ============================================================
  display?: Display;
  flexDirection?: FlexDirection;
  flexWrap?: FlexWrap;
  flex?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: CSSValue;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  alignContent?: 
    | 'flex-start' | 'center' | 'flex-end' | 'space-between' 
    | 'space-around' | 'stretch';
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  order?: number;

  // ============================================================
  // 8. GRID
  // ============================================================
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: CSSValue;
  gridColumn?: string;
  gridRow?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  placeItems?: string;
  placeContent?: string;

  // ============================================================
  // 9. BORDURES & OMBRES
  // ============================================================
  border?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  borderWidth?: CSSValue;
  borderStyle?: BorderStyle;
  borderColor?: string;
  borderRadius?: CSSValue;
  borderTopLeftRadius?: CSSValue;
  borderTopRightRadius?: CSSValue;
  borderBottomLeftRadius?: CSSValue;
  borderBottomRightRadius?: CSSValue;
  boxShadow?: string;
  outline?: string;
  outlineWidth?: CSSValue;
  outlineStyle?: BorderStyle;
  outlineColor?: string;

  // ============================================================
  // 10. TRANSITIONS & ANIMATIONS
  // ============================================================
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: 
    | 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' 
    | 'step-start' | 'step-end' | string;
  transitionDelay?: string;
  transform?: string;
  transformOrigin?: string;
  animation?: string;
  animationName?: string;
  animationDuration?: string;
  animationTimingFunction?: string;
  animationDelay?: string;
  animationIterationCount?: number | 'infinite';
  animationDirection?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  animationFillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  animationPlayState?: 'running' | 'paused';
  willChange?: string;

  // ============================================================
  // 11. FILTRES & EFFETS
  // ============================================================
  filter?: string;
  backdropFilter?: string;
  mixBlendMode?: 
    | 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' 
    | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' 
    | 'soft-light' | 'difference' | 'exclusion' | 'hue' 
    | 'saturation' | 'color' | 'luminosity';
  clipPath?: string;

  // ============================================================
  // 12. LISTES & TABLEAUX
  // ============================================================
  listStyle?: string;
  listStyleType?: string;
  listStylePosition?: 'inside' | 'outside';
  listStyleImage?: string;
  borderCollapse?: 'collapse' | 'separate';
  borderSpacing?: CSSValue;

  // ============================================================
  // 13. AUTRES
  // ============================================================
  direction?: 'ltr' | 'rtl';
  writingMode?: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';
  breakBefore?: 'auto' | 'avoid' | 'always' | 'page';
  breakAfter?: 'auto' | 'avoid' | 'always' | 'page';
  breakInside?: 'auto' | 'avoid' | 'avoid-page' | 'avoid-column';
  columnCount?: number;
  columnWidth?: CSSValue;
  columnGapOld?: CSSValue;
  columnRule?: string;
  isolation?: 'auto' | 'isolate';
  imageRendering?: 'auto' | 'crisp-edges' | 'pixelated';
}

export type CSSPropertiesPartial = Partial<CSSProperties>;

export function isCSSProperties(obj: any): obj is CSSProperties {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}
