import { supabase } from '../utils/supabase';

const toWorkspace = (w) => ({
    id: w.id,
    name: w.name,
    kind: w.kind,
    locationCount: w.location_count,
    itemCount: w.item_count,
});

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

export async function fetchHomeData() {
    const [ws, locs] = await Promise.all([
        supabase.from('workspace_summaries').select('*').order('created_at'),
        supabase.from('location_summaries').select('*').order('created_at'),
    ]);
    if (ws.error) throw ws.error;
    if (locs.error) throw locs.error;
    return {
        workspaces: ws.data.map(toWorkspace),
        locations: locs.data.map(toLocation),
    };
}