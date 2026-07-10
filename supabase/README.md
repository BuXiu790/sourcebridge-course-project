# SourceBridge Supabase setup

1. Create a Supabase project and apply `migrations/202607110001_sourcebridge_phase2.sql`.
2. Configure email/password authentication and require email confirmation.
3. Add local and production callback URLs to the Supabase Auth redirect allow list:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_PRIVATE_SITE_HOST/auth/callback`
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the application environment. A Supabase publishable key can be used in place of the legacy anon key if the environment variable keeps this name.
5. Do not add a service-role or secret key to this application. All application operations use the signed-in user session and RLS.

## Email templates

For PKCE-compatible server confirmation, configure the two templates separately:

```text
Confirm signup:
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email

Reset password:
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
```

Keep the Site URL and redirect allow list aligned with the environment being tested.

## Bootstrap the first admin

Every registration is forced to the `buyer` role by the database trigger. After the first intended admin has registered and verified email, run `admin/promote_user_by_email.sql` in the Supabase SQL editor, replacing the placeholder only at execution time. Subsequent role changes can use the admin-only `set_user_role` RPC through the protected admin UI.

## Security model

- Page and API handlers check the authenticated user and role server-side.
- RLS independently enforces ownership and staff access in PostgreSQL.
- Buyer access to quotes, timeline events, and attachments is derived from RFQ ownership.
- Supplier records are never readable or writable by buyers.
- Only admins can change profile roles.
