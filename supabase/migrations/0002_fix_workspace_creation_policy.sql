drop policy if exists "Members can read workspaces"
on public.workspaces;

create policy "Owners and members can read workspaces"
on public.workspaces
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or public.has_workspace_role(
    id,
    array['owner', 'editor', 'viewer']
  )
);