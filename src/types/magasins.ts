export interface Magasin {
  id: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logo_url?: string;
  ip_address?: string;
  ip_range?: string;
  ip_range_end?: string;
  code: string;
  actif: boolean;
  est_defaut: boolean; // 👈 NOUVEAU : indique si c'est le magasin par défaut
  created_at?: string;
  updated_at?: string;
}

export interface MagasinFormData {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logo_url?: string;
  ip_address?: string;
  ip_range?: string;
  ip_range_end?: string;
  code?: string;
  actif?: boolean;
  est_defaut?: boolean; // 👈 NOUVEAU
}
