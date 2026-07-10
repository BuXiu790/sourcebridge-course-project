# SourceBridge

SourceBridge is a responsive cross-border sourcing workflow for overseas Amazon sellers and China-based sourcing operations. Phase 2 adds Supabase email authentication, persistent buyer RFQs, database-enforced access control, and an operator/admin workspace while preserving the original B2B interface.

SourceBridge is an independent sourcing workflow prototype and is not affiliated with or endorsed by Amazon.

## Local development

Requirements:

- Node.js 22.13 or later
- npm
- A Supabase project for live authentication and persistent data

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and enter the public project values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The legacy Supabase anon key or the newer publishable key can be used for the second value. Never add a service-role or secret key to this application or expose one through a `NEXT_PUBLIC_` variable.

Apply [`supabase/migrations/202607110001_sourcebridge_phase2.sql`](supabase/migrations/202607110001_sourcebridge_phase2.sql) in Supabase, then configure the Auth redirect URLs and email templates described in [`supabase/README.md`](supabase/README.md).

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Implemented

- Email/password signup, required email confirmation flow, login, logout, forgot password, password reset, persisted cookie sessions, and auth callbacks
- Public homepage and auth routes, authenticated buyer routes, and staff-only admin routes
- `buyer`, `operator`, and `admin` profiles; every new signup is forced to `buyer` by a database trigger
- Server-side page/API authorization plus Supabase RLS on `profiles`, `rfqs`, `suppliers`, `supplier_quotes`, `timeline_events`, and `attachments`
- Buyer dashboard backed by the signed-in user's RFQs
- Four-step RFQ form that writes to Supabase and redirects to the saved RFQ
- Persistent RFQ detail, comparable quotes, timeline, attachments metadata, and quote selection
- Operator/admin overview, RFQ list and detail tools, status updates, supplier create/edit, quote entry, and timeline entry
- Admin-only user role management and a separate one-time bootstrap SQL script for the first admin
- Responsive layouts, labeled fields, keyboard-visible focus states, loading/empty/error states, and no-store headers for protected routes

## Routes and access

Public:

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/auth/callback` and `/auth/confirm`

Signed-in users:

- `/dashboard`
- `/rfqs/new`
- `/rfqs/[id]`
- `/reset-password` after a valid recovery session

Operator or admin:

- `/admin`
- `/admin/rfqs`
- `/admin/rfqs/[id]`
- `/admin/suppliers`
- `/admin/quotes`

Only admins can modify roles. Registration never accepts a role selection. See [`supabase/admin/promote_user_by_email.sql`](supabase/admin/promote_user_by_email.sql) for the one-time, owner-run bootstrap procedure; no administrator email is stored in source code.

## Demo data and current limitations

The public homepage retains clearly labeled prototype service targets and an illustrative RFQ preview. These are not operating results and are not loaded into authenticated buyer or admin records.

Business records require a configured Supabase project. Reference-file selection records only a filename; this phase does not upload a file or create a Supabase Storage object. The cost/profit model is shown only when explicit cost inputs are available and never inherits homepage demo assumptions. The project does not integrate payments, Amazon APIs, scraping, supplier portals, freight systems, or transactional email beyond Supabase Auth.

Without the two public Supabase environment variables and an applied migration, auth forms remain disabled and protected routes fail closed by redirecting to login. Live signup/email-delivery/RLS identity-matrix validation must be completed against the target Supabase project before changing a hosted site from private to public.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm test
```

`npm test` creates a production build, checks public rendering and fail-closed protected routes, and verifies core RLS/auth source contracts. Live multi-user checks still require a configured Supabase project and test accounts.

## Next phase

After production Supabase configuration and live security acceptance, the next phase can add Supabase Storage uploads, audit logs, transactional notifications, stronger rate limiting/abuse controls, and carefully scoped Amazon or logistics integrations. Sites access should remain private until the live authentication and RLS acceptance matrix passes.
