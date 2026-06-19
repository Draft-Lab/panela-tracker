# Auth setup

Admin access uses Supabase Auth (email + password) with an explicit allowlist in `admin_users`. The Discord bot uses a separate API key and is unaffected.

## Supabase Dashboard

1. **Authentication → Providers → Email**: keep enabled.
2. **Authentication → Settings**: disable public signups so only manually created users can log in.
3. **Authentication → Users**: create admin user(s) with email and password.

## SQL migrations (run in order)

1. [`009_tighten_rls_for_auth.sql`](009_tighten_rls_for_auth.sql) — closes public write access; keeps public read.
2. [`010_admin_users_rls.sql`](010_admin_users_rls.sql) — creates `admin_users`, `is_admin()` function, and write policies that check the allowlist (removes Supabase "RLS Policy Always True" warnings).

## Seed the first admin

After creating the user in Authentication and running script 010, insert their UUID into the allowlist:

```sql
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'seu@email.com';
```

To add another admin later, repeat the INSERT with their email (or `user_id` directly).

To remove an admin:

```sql
DELETE FROM public.admin_users WHERE user_id = 'uuid-do-usuario';
```

The `admin_users` table has RLS enabled with no policies for `anon`/`authenticated`, so it is not readable or writable via the normal API. Manage it via SQL Editor or service role only.

## Environment variables

See [`.env.example`](../.env.example). Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by Discord bot API routes)
- `DISCORD_BOT_API_KEY` (Bearer token the bot sends to `/api/discord/*`)

## Verify

1. Login with an allowlisted admin → dashboard works (create/edit/delete).
2. Login with a Supabase user **not** in `admin_users` → blocked with "Conta sem permissão de administrador".
3. Public pages (`/`, `/jogadores/*`) still load without login.
4. Bot API with valid `DISCORD_BOT_API_KEY` still returns 200.
5. Supabase **Security Advisor** — "RLS Policy Always True" warnings on write policies should be gone after script 010.
