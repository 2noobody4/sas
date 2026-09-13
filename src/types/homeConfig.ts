export interface HomeBlock {
  id: string;
  type: 'hero' | 'banner' | 'products' | 'featured' | 'features' | 'testimonials' | 'cta' | 'custom';
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  link_label?: string;
  order: number;        // utilisé par le code
  ordre: number;        // utilisé par la base (pour compatibilité)
  enabled: boolean;
  config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface HomeConfig {
  id: string;
  blocks: HomeBlock[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  header_style?: string;
  show_header?: boolean;
  show_footer?: boolean;
  custom_css?: string;
  custom_js?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HomeBlockFormData {
  type: 'hero' | 'banner' | 'products' | 'featured' | 'features' | 'testimonials' | 'cta' | 'custom';
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  link_label?: string;
  order: number;
  enabled: boolean;
  config?: Record<string, any>;
}
