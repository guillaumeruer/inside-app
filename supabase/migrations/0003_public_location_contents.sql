begin;

create or replace function public.get_public_location_contents(
  target_qr_token uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', container.id,
    'name', container.name,
    'description', container.description,

    'child_locations',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', child.id,
            'name', child.name,
            'description', child.description
          )
          order by child.created_at
        )
        from public.locations as child
        where child.parent_id = container.id
          and child.workspace_id = container.workspace_id
      ),
      '[]'::jsonb
    ),

    'items',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', item.id,
            'name', item.name,
            'description', item.description,
            'quantity', item.quantity
          )
          order by item.created_at
        )
        from public.items as item
        where item.location_id = container.id
          and item.workspace_id = container.workspace_id
      ),
      '[]'::jsonb
    )
  )
  from public.locations as container
  where container.qr_token = target_qr_token
  limit 1;
$$;

revoke all
  on function public.get_public_location_contents(uuid)
  from public, anon, authenticated;

grant execute
  on function public.get_public_location_contents(uuid)
  to anon, authenticated;

commit;