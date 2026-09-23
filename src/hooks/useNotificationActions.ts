// ============================================================
// USE NOTIFICATION ACTIONS — Helpers d'envoi de notifications
// Version V1 — Compatible React 16
// ============================================================

import { supabase } from '../lib/supabaseClient';

export interface NotifyPayload {
  title: string;
  content: string;
  type?: 'message' | 'vente' | 'stock' | 'promotion' | 'system';
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Envoie une notification à une liste d'utilisateurs.
 * Insert batch dans la table `notifications`.
 */
export async function notifyUsers(userIds: string[], payload: NotifyPayload): Promise<void> {
  if (!userIds || userIds.length === 0) return;

  const rows = userIds.map((uid) => ({
    user_id: uid,
    type: payload.type || 'system',
    title: payload.title,
    content: payload.content,
    link: payload.link || null,
    metadata: payload.metadata || null,
    read: false,
  }));

  const { error } = await supabase.from('notifications').insert(rows);
  if (error) {
    console.warn('[notifyUsers] Erreur insert:', error);
  }
}

/**
 * Envoie une notification à tous les admins + gestionnaires.
 */
export async function notifyAdmins(payload: NotifyPayload): Promise<void> {
  try {
    const { data: roles } = await supabase
      .from('roles')
      .select('id, nom')
      .in('nom', ['admin', 'gestionnaire']);

    const roleIds = (roles || []).map((r: any) => r.id);
    if (roleIds.length === 0) return;

    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .in('role_id', roleIds)
      .eq('actif', true);

    const ids = (admins || []).map((u: any) => u.id);
    await notifyUsers(ids, payload);
  } catch (err) {
    console.warn('[notifyAdmins] Erreur:', err);
  }
}

/**
 * Envoie une notification à un utilisateur par son id.
 */
export async function notifyUser(userId: string, payload: NotifyPayload): Promise<void> {
  await notifyUsers([userId], payload);
}
