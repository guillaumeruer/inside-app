begin;

-- Workspaces ---------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null
    check (char_length(trim(name)) between 1 and 100),
  owner_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,
  user_id uuid not null
    references auth.users(id) on delete cascade,
  role text not null
    check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),

  primary key (workspace_id, user_id)
);

create index workspace_members_user_id_idx
  on public.workspace_members(user_id);

-- Locations ----------------------------------------------------------------

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,
  parent_id uuid,
  name text not null
    check (char_length(trim(name)) between 1 and 120),
  description text,
  qr_token uuid not null unique default gen_random_uuid(),
  created_by uuid not null default auth.uid()
    references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, workspace_id),

  foreign key (parent_id, workspace_id)
    references public.locations(id, workspace_id)
    on delete restrict
);

create index locations_workspace_parent_idx
  on public.locations(workspace_id, parent_id);

-- Items --------------------------------------------------------------------

create table public.items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,
  location_id uuid not null,
  name text not null
    check (char_length(trim(name)) between 1 and 160),
  description text,
  quantity integer not null default 1
    check (quantity > 0),
  created_by uuid not null default auth.uid()
    references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, workspace_id),

  foreign key (location_id, workspace_id)
    references public.locations(id, workspace_id)
    on delete restrict
);

create index items_workspace_location_idx
  on public.items(workspace_id, location_id);

create index items_workspace_name_idx
  on public.items(workspace_id, lower(name));

-- Labels -------------------------------------------------------------------

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,
  name text not null
    check (char_length(trim(name)) between 1 and 50),
  created_by uuid not null default auth.uid()
    references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, workspace_id)
);

create unique index labels_workspace_name_unique_idx
  on public.labels(workspace_id, lower(name));

create table public.item_labels (
  workspace_id uuid not null,
  item_id uuid not null,
  label_id uuid not null,
  created_at timestamptz not null default now(),

  primary key (item_id, label_id),

  foreign key (workspace_id)
    references public.workspaces(id)
    on delete cascade,

  foreign key (item_id, workspace_id)
    references public.items(id, workspace_id)
    on delete cascade,

  foreign key (label_id, workspace_id)
    references public.labels(id, workspace_id)
    on delete cascade
);

create index item_labels_workspace_idx
  on public.item_labels(workspace_id);

-- Utility functions --------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members as member
    where member.workspace_id = target_workspace_id
      and member.user_id = (select auth.uid())
      and member.role = any(allowed_roles)
  );
$$;

create function public.add_workspace_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_members (
    workspace_id,
    user_id,
    role
  )
  values (
    new.id,
    new.owner_id,
    'owner'
  );

  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.add_workspace_owner_membership() from public;
revoke all on function public.has_workspace_role(uuid, text[]) from public;

grant execute
  on function public.has_workspace_role(uuid, text[])
  to authenticated;

-- Triggers -----------------------------------------------------------------

create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

create trigger items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create trigger labels_set_updated_at
before update on public.labels
for each row execute function public.set_updated_at();

create trigger workspaces_add_owner
after insert on public.workspaces
for each row
execute function public.add_workspace_owner_membership();

-- Row Level Security -------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.locations enable row level security;
alter table public.items enable row level security;
alter table public.labels enable row level security;
alter table public.item_labels enable row level security;

-- Remove implicit access before granting the minimum required.

revoke all on public.workspaces from anon, authenticated;
revoke all on public.workspace_members from anon, authenticated;
revoke all on public.locations from anon, authenticated;
revoke all on public.items from anon, authenticated;
revoke all on public.labels from anon, authenticated;
revoke all on public.item_labels from anon, authenticated;

grant select, delete on public.workspaces to authenticated;
grant insert (name, owner_id) on public.workspaces to authenticated;
grant update (name) on public.workspaces to authenticated;

grant select on public.workspace_members to authenticated;

grant select, delete on public.locations to authenticated;
grant insert (
  workspace_id,
  parent_id,
  name,
  description,
  created_by
) on public.locations to authenticated;
grant update (
  parent_id,
  name,
  description
) on public.locations to authenticated;

grant select, delete on public.items to authenticated;
grant insert (
  workspace_id,
  location_id,
  name,
  description,
  quantity,
  created_by
) on public.items to authenticated;
grant update (
  location_id,
  name,
  description,
  quantity
) on public.items to authenticated;

grant select, delete on public.labels to authenticated;
grant insert (
  workspace_id,
  name,
  created_by
) on public.labels to authenticated;
grant update (name) on public.labels to authenticated;

grant select, insert, delete
  on public.item_labels
  to authenticated;

-- Workspace policies -------------------------------------------------------

create policy "Members can read workspaces"
on public.workspaces
for select
to authenticated
using (
  public.has_workspace_role(
    id,
    array['owner', 'editor', 'viewer']
  )
);

create policy "Users can create owned workspaces"
on public.workspaces
for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "Editors can update workspaces"
on public.workspaces
for update
to authenticated
using (
  public.has_workspace_role(
    id,
    array['owner', 'editor']
  )
)
with check (
  public.has_workspace_role(
    id,
    array['owner', 'editor']
  )
);

create policy "Owners can delete workspaces"
on public.workspaces
for delete
to authenticated
using (
  public.has_workspace_role(
    id,
    array['owner']
  )
);

-- Membership policies ------------------------------------------------------

create policy "Members can read workspace memberships"
on public.workspace_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.has_workspace_role(
    workspace_id,
    array['owner', 'editor', 'viewer']
  )
);

-- Location policies --------------------------------------------------------

create policy "Members can read locations"
on public.locations
for select
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor', 'viewer']
  )
);

create policy "Editors can create locations"
on public.locations
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

create policy "Editors can update locations"
on public.locations
for update
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
)
with check (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

create policy "Editors can delete locations"
on public.locations
for delete
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

-- Item policies ------------------------------------------------------------

create policy "Members can read items"
on public.items
for select
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor', 'viewer']
  )
);

create policy "Editors can create items"
on public.items
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

create policy "Editors can update items"
on public.items
for update
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
)
with check (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

create policy "Editors can delete items"
on public.items
for delete
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

-- Label policies -----------------------------------------------------------

create policy "Members can read labels"
on public.labels
for select
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor', 'viewer']
  )
);

create policy "Editors can create labels"
on public.labels
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

create policy "Editors can update labels"
on public.labels
for update
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
)
with check (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

create policy "Editors can delete labels"
on public.labels
for delete
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

-- Item-label policies ------------------------------------------------------

create policy "Members can read item labels"
on public.item_labels
for select
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor', 'viewer']
  )
);

create policy "Editors can attach labels"
on public.item_labels
for insert
to authenticated
with check (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

create policy "Editors can detach labels"
on public.item_labels
for delete
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'editor']
  )
);

commit;