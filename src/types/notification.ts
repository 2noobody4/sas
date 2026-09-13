export type NotificationType = 'message' | 'vente' | 'stock' | 'promotion' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  search?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  limit?: number;
}
