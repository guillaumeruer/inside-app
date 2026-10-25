import { supabase } from '@/lib/supabase';

const toLocation = (l) => ({
  id: l.id,
  workspaceId: l.workspace_id,
  parentId: l.parent_id,
  name: l.name,
  description: l.description,
  qrToken: l.qr_token,
  parentName: l.parent_name,
  childCount: l.child_count,
  itemCount: l.item_count,
  previewItems: l.preview_items,
});

export async function fecthLocationSummaries() {
  const { data, error } = await supabase.from('location_summaries').select('*').order('created_at');
  if (error) {
    throw error;
  }
  return data.map(toLocation);
}
