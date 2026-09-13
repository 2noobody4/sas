// ============================================================
// ATTRIBUTS SERVICE - Types
// Version V3 - Compatible React 16
// ============================================================

export type AttributType = 'text' | 'email' | 'tel' | 'textarea' | 'number' | 'date';

export interface AttributService {
  id: string;
  nom: string;
  type: AttributType;
  obligatoire: boolean;
  ordre: number;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttributServiceFormData {
  nom: string;
  type: AttributType;
  obligatoire?: boolean;
  ordre?: number;
  actif?: boolean;
}
