create extension if not exists pgcrypto;
create schema if not exists private;

create type public.user_role as enum ('buyer', 'operator', 'admin');
create type public.rfq_status as enum (
  'draft',
  'sourcing',
  'quotes_ready',
  'sample_review',
  'in_production',
  'quality_inspection',
  'shipping',
  'completed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx on public.profiles (lower(email));

create table public.rfqs (
  id uuid primary key default gen_random_uuid(),
  rfq_number text not null unique default (
    'RFQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  product_name text not null,
  product_category text not null,
  reference_url text,
  product_description text not null,
  reference_file_name text,
  material text not null,
  dimensions text not null,
  color text not null,
  custom_logo text not null default 'No',
  custom_packaging text not null default 'No',
  additional_requirements text,
  target_quantity integer not null check (target_quantity > 0),
  target_unit_price numeric(12, 2) not null check (target_unit_price > 0),
  destination_country text not null,
  amazon_marketplace text not null,
  desired_delivery_date date not null,
  sample_required text not null default 'Yes',
  preferred_fulfillment text not null default 'Amazon FBA',
  status public.rfq_status not null default 'sourcing',
  selected_quote_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rfqs_buyer_id_idx on public.rfqs (buyer_id);
create index rfqs_status_idx on public.rfqs (status);
create index rfqs_created_at_idx on public.rfqs (created_at desc);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_code text not null unique default (
    'CN-SUP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  company_name text not null,
  contact_email text,
  location text,
  capabilities text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.supplier_quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  supplier_label text not null,
  unit_price numeric(12, 2) not null check (unit_price > 0),
  moq integer not null check (moq > 0),
  sample_cost numeric(12, 2) not null default 0 check (sample_cost >= 0),
  lead_time_days integer not null check (lead_time_days > 0),
  packaging text not null,
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rfq_id, supplier_id)
);

create index supplier_quotes_rfq_id_idx on public.supplier_quotes (rfq_id);
create index supplier_quotes_supplier_id_idx on public.supplier_quotes (supplier_id);

alter table public.rfqs
  add constraint rfqs_selected_quote_id_fkey
  foreign key (selected_quote_id) references public.supplier_quotes(id) on delete set null;

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  status public.rfq_status,
  title text not null,
  detail text not null,
  event_date timestamptz not null default now(),
  sort_order integer not null default 0,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index timeline_events_rfq_id_idx on public.timeline_events (rfq_id, sort_order, event_date);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  category text not null default 'reference',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index attachments_rfq_id_idx on public.attachments (rfq_id);

create or replace function private.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.current_user_role()) in ('operator', 'admin'), false)
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.current_user_role()) = 'admin', false)
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger rfqs_set_updated_at before update on public.rfqs
for each row execute function private.set_updated_at();
create trigger suppliers_set_updated_at before update on public.suppliers
for each row execute function private.set_updated_at();
create trigger supplier_quotes_set_updated_at before update on public.supplier_quotes
for each row execute function private.set_updated_at();
create trigger timeline_events_set_updated_at before update on public.timeline_events
for each row execute function private.set_updated_at();
create trigger attachments_set_updated_at before update on public.attachments
for each row execute function private.set_updated_at();

create or replace function private.handle_new_rfq()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.timeline_events (
    rfq_id,
    status,
    title,
    detail,
    event_date,
    sort_order,
    created_by
  ) values (
    new.id,
    'draft',
    'Requirements Submitted',
    'Buyer requirements were submitted to the sourcing team.',
    new.created_at,
    10,
    new.buyer_id
  );
  return new;
end;
$$;

create trigger on_rfq_created
after insert on public.rfqs
for each row execute function private.handle_new_rfq();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'buyer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.protect_rfq_staff_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_staff()) then
    if new.buyer_id is distinct from old.buyer_id
      or new.rfq_number is distinct from old.rfq_number
      or new.status is distinct from old.status then
      raise exception 'Only operator or admin users can change RFQ ownership, number, or status';
    end if;
  end if;

  if new.selected_quote_id is not null and not exists (
    select 1
    from public.supplier_quotes quote
    where quote.id = new.selected_quote_id and quote.rfq_id = old.id
  ) then
    raise exception 'Selected quote must belong to this RFQ';
  end if;

  return new;
end;
$$;

create trigger rfqs_protect_staff_fields
before update on public.rfqs
for each row execute function private.protect_rfq_staff_fields();

create or replace function public.set_user_role(
  target_email text,
  new_role public.user_role
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_profile public.profiles;
begin
  if not (select private.is_admin()) then
    raise exception 'Only admin users can modify roles';
  end if;

  update public.profiles
  set role = new_role
  where lower(email) = lower(target_email)
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'No registered profile found for the supplied email';
  end if;

  return updated_profile;
end;
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on function private.current_user_role() from public;
revoke all on function private.is_staff() from public;
revoke all on function private.is_admin() from public;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.is_admin() to authenticated;
revoke all on function public.set_user_role(text, public.user_role) from public;
grant execute on function public.set_user_role(text, public.user_role) to authenticated;

alter table public.profiles enable row level security;
alter table public.rfqs enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_quotes enable row level security;
alter table public.timeline_events enable row level security;
alter table public.attachments enable row level security;

create policy profiles_select_own_or_staff
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_staff()));

create policy profiles_update_admin_only
on public.profiles for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy rfqs_select_owner_or_staff
on public.rfqs for select to authenticated
using (buyer_id = (select auth.uid()) or (select private.is_staff()));

create policy rfqs_insert_owner_or_staff
on public.rfqs for insert to authenticated
with check (buyer_id = (select auth.uid()) or (select private.is_staff()));

create policy rfqs_update_owner_or_staff
on public.rfqs for update to authenticated
using (buyer_id = (select auth.uid()) or (select private.is_staff()))
with check (buyer_id = (select auth.uid()) or (select private.is_staff()));

create policy suppliers_select_staff
on public.suppliers for select to authenticated
using ((select private.is_staff()));

create policy suppliers_insert_staff
on public.suppliers for insert to authenticated
with check ((select private.is_staff()));

create policy suppliers_update_staff
on public.suppliers for update to authenticated
using ((select private.is_staff()))
with check ((select private.is_staff()));

create policy suppliers_delete_staff
on public.suppliers for delete to authenticated
using ((select private.is_staff()));

create policy supplier_quotes_select_related_buyer_or_staff
on public.supplier_quotes for select to authenticated
using (
  (select private.is_staff())
  or exists (
    select 1 from public.rfqs rfq
    where rfq.id = supplier_quotes.rfq_id
      and rfq.buyer_id = (select auth.uid())
  )
);

create policy supplier_quotes_insert_staff
on public.supplier_quotes for insert to authenticated
with check ((select private.is_staff()) and created_by = (select auth.uid()));

create policy supplier_quotes_update_staff
on public.supplier_quotes for update to authenticated
using ((select private.is_staff()))
with check ((select private.is_staff()));

create policy supplier_quotes_delete_staff
on public.supplier_quotes for delete to authenticated
using ((select private.is_staff()));

create policy timeline_events_select_related_buyer_or_staff
on public.timeline_events for select to authenticated
using (
  (select private.is_staff())
  or exists (
    select 1 from public.rfqs rfq
    where rfq.id = timeline_events.rfq_id
      and rfq.buyer_id = (select auth.uid())
  )
);

create policy timeline_events_insert_staff
on public.timeline_events for insert to authenticated
with check ((select private.is_staff()) and created_by = (select auth.uid()));

create policy timeline_events_update_staff
on public.timeline_events for update to authenticated
using ((select private.is_staff()))
with check ((select private.is_staff()));

create policy timeline_events_delete_staff
on public.timeline_events for delete to authenticated
using ((select private.is_staff()));

create policy attachments_select_related_buyer_or_staff
on public.attachments for select to authenticated
using (
  (select private.is_staff())
  or exists (
    select 1 from public.rfqs rfq
    where rfq.id = attachments.rfq_id
      and rfq.buyer_id = (select auth.uid())
  )
);

create policy attachments_insert_owner_or_staff
on public.attachments for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and (
    (select private.is_staff())
    or exists (
      select 1 from public.rfqs rfq
      where rfq.id = attachments.rfq_id
        and rfq.buyer_id = (select auth.uid())
    )
  )
);

create policy attachments_update_owner_or_staff
on public.attachments for update to authenticated
using (
  (select private.is_staff())
  or exists (
    select 1 from public.rfqs rfq
    where rfq.id = attachments.rfq_id
      and rfq.buyer_id = (select auth.uid())
  )
)
with check (
  (select private.is_staff())
  or (
    uploaded_by = (select auth.uid())
    and exists (
      select 1 from public.rfqs rfq
      where rfq.id = attachments.rfq_id
        and rfq.buyer_id = (select auth.uid())
    )
  )
);

create policy attachments_delete_owner_or_staff
on public.attachments for delete to authenticated
using (
  (select private.is_staff())
  or exists (
    select 1 from public.rfqs rfq
    where rfq.id = attachments.rfq_id
      and rfq.buyer_id = (select auth.uid())
  )
);

revoke all on public.profiles, public.rfqs, public.suppliers,
  public.supplier_quotes, public.timeline_events, public.attachments from anon;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.rfqs to authenticated;
grant select, insert, update, delete on public.suppliers to authenticated;
grant select, insert, update, delete on public.supplier_quotes to authenticated;
grant select, insert, update, delete on public.timeline_events to authenticated;
grant select, insert, update, delete on public.attachments to authenticated;

comment on function public.set_user_role(text, public.user_role) is
  'Admin-only RPC. New users are always buyers; use this only after authenticating as an admin.';
