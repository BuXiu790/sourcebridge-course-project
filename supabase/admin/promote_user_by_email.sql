-- One-time bootstrap for the first admin. Run only in the Supabase SQL editor
-- as the project owner after the target user has registered and verified email.
-- Replace the placeholder at execution time; never commit a real email here.

begin;

do $$
declare
  target_email constant text := 'REPLACE_WITH_REGISTERED_EMAIL';
  affected_rows integer;
begin
  if target_email = 'REPLACE_WITH_REGISTERED_EMAIL' then
    raise exception 'Replace REPLACE_WITH_REGISTERED_EMAIL before running this script';
  end if;

  update public.profiles
  set role = 'admin'
  where lower(email) = lower(target_email);

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Expected exactly one registered profile, updated %', affected_rows;
  end if;
end;
$$;

commit;
