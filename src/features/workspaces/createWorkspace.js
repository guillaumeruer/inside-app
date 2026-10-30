import { supabase } from '@/lib/supabase';

export async function createWorkspace({ name, kind, ownerId }) {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name: name.trim(), kind, owner_id: ownerId })
    .select('id, name, kind')
    .single();

  if (error) throw error;
  return data;
}
