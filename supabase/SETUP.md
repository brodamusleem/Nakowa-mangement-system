# Supabase setup: users first

The initial migration creates the database schema and role access policies. It inserts no restaurant records. Demo accounts from `data/db.json` are not used; menu, inventory, bookings, orders, and transactions stay empty until Nakowa adds its real records.

## 1. Configure the project

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Keep `SUPABASE_SERVICE_ROLE_KEY` out of frontend code and never prefix it with `VITE_`.

Apply `migrations/20261123000000_initial_nakowa_schema.sql` to the Supabase project using the SQL editor or Supabase CLI.

## 2. Create the first administrator

Set `NAKOWA_ADMIN_EMAIL`, `NAKOWA_ADMIN_NAME`, and a strong `NAKOWA_ADMIN_PASSWORD` in `.env.local`, alongside the project URL and service role key. Then run once:

```sh
npm run supabase:bootstrap-admin
```

This creates one real Supabase Auth account and its `admin` profile. The script refuses to promote an existing Auth account. Remove the bootstrap credentials from `.env.local` after setup. Use **Users & Roles** in the app to add real staff accounts with their roles and initial passwords. The login form uses passwords; the demo PIN credentials are not used.

## 3. Deploy account management

Deploy the protected function after linking the Supabase project:

```sh
supabase functions deploy admin-users
```

The function checks the caller's Supabase session and active `admin` profile before it uses the service role key to create accounts, update account details, or disable sign-in. Supabase provides the function's project URL and service role secret at runtime.

The roles are `admin`, `manager`, `cashier`, `waiter`, and `kitchen`. Database row-level security policies enforce their access. Admins can manage users; managers can manage menu, inventory, and events; cashiers and waiters can update tables; operational roles can manage orders; financial data is limited to admins, managers, and cashiers.
