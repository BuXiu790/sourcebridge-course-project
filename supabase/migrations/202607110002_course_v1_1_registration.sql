-- SourceBridge Course Release v1.1
-- Public email/password registration is a dashboard configuration. This
-- migration keeps every ordinary signup at the Buyer role and adds course
-- data limits without weakening RLS.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Deliberately ignore all role-like auth metadata. Only the optional display
  -- name is copied; the database always assigns the Buyer role.
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

create or replace function private.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    if new.id is distinct from old.id
      or new.email is distinct from old.email
      or new.role is distinct from old.role
      or new.created_at is distinct from old.created_at then
      raise exception 'Buyer profiles may only update non-privileged fields';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged_fields on public.profiles;
create trigger profiles_protect_privileged_fields
before update on public.profiles
for each row execute function private.protect_profile_privileged_fields();

drop policy if exists profiles_update_own_safe on public.profiles;
create policy profiles_update_own_safe
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create or replace function private.enforce_course_rfq_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_staff()) then
    -- Serialize inserts per Buyer so concurrent requests cannot exceed the
    -- five-RFQ course allowance.
    perform pg_advisory_xact_lock(hashtextextended(new.buyer_id::text, 0));
    if (select count(*) from public.rfqs where buyer_id = new.buyer_id) >= 5 then
      raise exception 'Course demo limit reached. Buyer accounts can create up to 5 sourcing requests.'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists rfqs_enforce_course_limit on public.rfqs;
create trigger rfqs_enforce_course_limit
before insert on public.rfqs
for each row execute function private.enforce_course_rfq_limit();

drop policy if exists rfqs_delete_admin_only on public.rfqs;
create policy rfqs_delete_admin_only
on public.rfqs for delete to authenticated
using ((select private.is_admin()));

grant delete on public.rfqs to authenticated;

comment on function private.handle_new_user() is
  'Creates a Buyer profile for every ordinary Auth signup and ignores role metadata.';
comment on function private.enforce_course_rfq_limit() is
  'Course v1.1 limit: non-staff users may own at most five RFQs.';
