import { Utilisateur as User } from './modules';

export interface Message {
  id: string;
  sender_id: string;
  sender?: User;
  receiver_id: string;
  receiver?: User;
  subject?: string;
  content: string;
  read: boolean;
  read_at?: string;
  parent_id?: string;
  parent?: Message;
  replies?: Message[];
  created_at: string;
  updated_at: string;
}

export interface MessageFormData {
  receiver_id: string;
  subject?: string;
  content: string;
  parent_id?: string;
}

export interface MessageFilter {
  type?: 'inbox' | 'sent' | 'unread';
  search?: string;
  page?: number;
  limit?: number;
}

export interface Conversation {
  user_id: string;
  user: User;
  last_message: Message;
  unread_count: number;
  last_message_at: string;
}
export interface Message {
  id: string;
  sender_id: string;
  sender?: User;
  receiver_id: string;
  receiver?: User;
  subject?: string;
  content: string;
  audio_url?: string;
  read: boolean;
  read_at?: string;
  parent_id?: string;
  parent?: Message;
  replies?: Message[];
  created_at: string;
  updated_at: string;
}
