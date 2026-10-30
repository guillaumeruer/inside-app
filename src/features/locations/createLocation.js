import { supabase } from '@/lib/supabase';

/**
 * Crée un emplacement. qr_token est généré par la base (default gen_random_uuid()),
 * is_public vaut false par défaut. created_by est exigé par la policy d'insertion.
 */
export async function createLocation({ workspaceId, parentId, name, description, userId }) {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      workspace_id: workspaceId,
      parent_id: parentId ?? null,
      name: name.trim(),
      description: description?.trim() || null,
      created_by: userId,
    })
    .select('id, name, parent_id, qr_token')
    .single();

  if (error) throw error;
  return data;
}
