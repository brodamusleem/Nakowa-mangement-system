# Supabase setup: users first

The initial migration creates the database schema and role access policies. It does not insert restaurant records. The migration script imports staff accounts and profiles only; menu, inventory, bookings, orders, and transactions remain empty until a later data import.

## 1. Configure the project

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side and never prefix it with `VITE_`.

Apply `migrations/20261123000000_initial_nakowa_schema.sql` to the Supabase project using the SQL editor or Supabase CLI.

## 2. Import staff accounts only

Set the project URL and service role key in `.env.local`, then run:

```sh
npm run supabase:migrate
```

This creates Supabase Auth users from `data/db.json`'s users and upserts their profiles and roles. The old PIN is used as the initial password. Staff should change it to a unique password after first sign-in. No other `db.json` records are imported.

The staff list includes the initial administrator account. The first administrator must be provisioned this way because normal account management is restricted to an already active administrator.

## 3. Deploy account management

Deploy the protected function after linking the Supabase project:

```sh
supabase functions deploy admin-users
```

The function checks the caller's Supabase session and active `admin` profile before it uses the service role key to create accounts, update account details, or disable sign-in. Supabase provides the function's project URL and service role secret at runtime.

The available roles are `admin`, `manager`, `cashier`, `waiter`, and `kitchen`. Database row-level security policies enforce their access. Admins can manage users; managers can manage menu, inventory, and events; cashiers and waiters can update tables; operational roles can manage orders; financial data is limited to admins, managers, and cashiers.
