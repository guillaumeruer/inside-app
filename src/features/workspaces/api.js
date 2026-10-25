import { supabase } from '@/lib/supabase';

const toWorkspace = (w) => ({
  id: w.id,
  name: w.name,
  kind: w.kind,
  locationCount: w.location_count,
  itemCount: w.item_count,
});

export async function fetchWorkspaceSummaries() {
  const { data, error } = await supabase
    .from('workspace_summaries')
    .select('*')
    .order('created_at');
  if (error) {
    throw error;
  }
  return data.map(toWorkspace);
}
