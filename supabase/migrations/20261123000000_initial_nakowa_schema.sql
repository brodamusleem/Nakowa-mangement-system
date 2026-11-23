create type public.user_role as enum ('admin', 'manager', 'cashier', 'waiter', 'kitchen');
create type public.order_status as enum ('pending', 'preparing', 'ready', 'completed', 'cancelled');
create type public.kitchen_status as enum ('pending', 'preparing', 'ready');
create type public.payment_status as enum ('unpaid', 'paid', 'refunded');
create type public.order_type as enum ('dine-in', 'takeaway');
create type public.table_status as enum ('available', 'occupied', 'reserved');
create type public.event_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.payment_method as enum ('cash', 'card', 'mobile', 'transfer');
create type public.transaction_status as enum ('paid', 'refunded', 'completed', 'failed', 'pending');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  legacy_id text unique,
  name text not null,
  email text not null unique,
  role public.user_role not null,
  avatar text,
  active boolean not null default true
);

create table public.categories (
  id text primary key,
  name text not null,
  icon text,
  sort_order integer not null default 0
);

create table public.tables (
  id text primary key,
  name text not null,
  capacity integer not null check (capacity > 0),
  status public.table_status not null default 'available'
);

create table public.menu_items (
  id text primary key,
  category_id text not null references public.categories(id),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  unit text not null,
  available boolean not null default true,
  prep_time integer not null default 0,
  image text
);

create table public.orders (
  id text primary key,
  order_number text not null unique,
  type public.order_type not null,
  table_id text references public.tables(id),
  table_name text,
  waiter_id uuid not null references public.profiles(id),
  waiter_name text not null,
  status public.order_status not null default 'pending',
  kitchen_status public.kitchen_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  subtotal numeric(12,2) not null default 0,
  vat numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method public.payment_method,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  menu_item_id text references public.menu_items(id),
  name text not null,
  qty integer not null check (qty > 0),
  price numeric(12,2) not null check (price >= 0),
  note text not null default ''
);

create table public.transactions (
  id text primary key,
  order_id text references public.orders(id),
  order_number text not null,
  cashier_id uuid references public.profiles(id),
  cashier_name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  method public.payment_method not null,
  amount_given numeric(12,2) not null default 0,
  change numeric(12,2) not null default 0,
  status public.transaction_status not null default 'paid',
  receipt_number text not null unique,
  created_at timestamptz not null default now()
);

create table public.inventory (
  id text primary key,
  name text not null,
  category text,
  unit text not null,
  quantity numeric(12,2) not null default 0,
  min_quantity numeric(12,2) not null default 0,
  reorder_level numeric(12,2) not null default 0,
  cost_per_unit numeric(12,2) not null default 0,
  cost numeric(12,2) not null default 0
);

create table public.events (
  id text primary key,
  title text not null,
  hall text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  client_name text not null,
  client_phone text not null,
  guest_count integer not null check (guest_count >= 0),
  status public.event_status not null default 'pending',
  deposit_paid numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null,
  balance numeric(12,2) not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true
  );
$$;

create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and active = true
      and role in ('admin', 'manager')
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tables enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.transactions enable row level security;
alter table public.inventory enable row level security;
alter table public.events enable row level security;

create policy "staff read profiles" on public.profiles
  for select to authenticated using (public.is_staff());
create policy "admins manage profiles" on public.profiles
  for all to authenticated using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "staff read menu" on public.categories
  for select to authenticated using (public.is_staff());
create policy "staff manage menu" on public.categories
  for all to authenticated
  using (public.is_admin_or_manager())
  with check (public.is_admin_or_manager());

create policy "staff read menu items" on public.menu_items
  for select to authenticated using (public.is_staff());
create policy "staff manage menu items" on public.menu_items
  for all to authenticated
  using (public.is_admin_or_manager())
  with check (public.is_admin_or_manager());

create policy "staff read tables" on public.tables
  for select to authenticated using (public.is_staff());
create policy "cashier and managers manage tables" on public.tables
  for all to authenticated
  using (public.current_role() in ('admin', 'manager', 'cashier', 'waiter'))
  with check (public.current_role() in ('admin', 'manager', 'cashier', 'waiter'));

create policy "staff read orders" on public.orders
  for select to authenticated using (public.is_staff());
create policy "orders can be written by operational roles" on public.orders
  for all to authenticated
  using (public.current_role() in ('admin', 'manager', 'cashier', 'waiter', 'kitchen'))
  with check (public.current_role() in ('admin', 'manager', 'cashier', 'waiter', 'kitchen'));

create policy "staff read order items" on public.order_items
  for select to authenticated using (public.is_staff());
create policy "operational roles manage order items" on public.order_items
  for all to authenticated
  using (public.current_role() in ('admin', 'manager', 'cashier', 'waiter', 'kitchen'))
  with check (public.current_role() in ('admin', 'manager', 'cashier', 'waiter', 'kitchen'));

create policy "financial roles read transactions" on public.transactions
  for select to authenticated
  using (public.current_role() in ('admin', 'manager', 'cashier'));
create policy "cashiers create transactions" on public.transactions
  for insert to authenticated
  with check (public.current_role() in ('admin', 'manager', 'cashier'));

create policy "staff read inventory" on public.inventory
  for select to authenticated using (public.is_staff());
create policy "managers manage inventory" on public.inventory
  for all to authenticated
  using (public.is_admin_or_manager())
  with check (public.is_admin_or_manager());

create policy "staff read events" on public.events
  for select to authenticated using (public.is_staff());
create policy "managers manage events" on public.events
  for all to authenticated
  using (public.is_admin_or_manager())
  with check (public.is_admin_or_manager());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.create_order(
  p_type public.order_type,
  p_table_id text,
  p_table_name text,
  p_items jsonb
) returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_order public.orders%rowtype;
  v_item jsonb;
  v_menu public.menu_items%rowtype;
  v_subtotal numeric(12,2) := 0;
  v_vat numeric(12,2);
  v_count integer;
  v_id text;
begin
  select * into v_profile from public.profiles where id = auth.uid() and active;
  if not found then raise exception 'Authenticated staff account not found'; end if;

  select count(*) into v_count from public.orders;
  v_id := 'ord-' || to_char(extract(epoch from clock_timestamp()) * 1000, 'FM9999999999999');

  insert into public.orders (
    id, order_number, type, table_id, table_name, waiter_id, waiter_name
  ) values (
    v_id,
    'ORD-' || lpad((v_count + 1)::text, 3, '0'),
    p_type,
    p_table_id,
    p_table_name,
    v_profile.id,
    v_profile.name
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_menu
    from public.menu_items
    where id = v_item->>'menuItemId' and available;

    if not found then raise exception 'Menu item is unavailable'; end if;

    insert into public.order_items (
      order_id, menu_item_id, name, qty, price, note
    ) values (
      v_order.id,
      v_menu.id,
      v_menu.name,
      greatest((v_item->>'qty')::integer, 1),
      v_menu.price,
      coalesce(v_item->>'note', '')
    );

    v_subtotal := v_subtotal + v_menu.price * greatest((v_item->>'qty')::integer, 1);
  end loop;

  v_vat := round(v_subtotal * 0.075);

  update public.orders
  set subtotal = v_subtotal,
      vat = v_vat,
      total = v_subtotal + v_vat
  where id = v_order.id
  returning * into v_order;

  if p_table_id is not null then
    update public.tables set status = 'occupied' where id = p_table_id;
  end if;

  return v_order;
end;
$$;

create or replace function public.complete_payment(
  p_order_id text,
  p_payment_method public.payment_method,
  p_amount_given numeric
) returns public.transactions
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_order public.orders%rowtype;
  v_transaction public.transactions%rowtype;
  v_change numeric(12,2);
  v_txn_count integer;
  v_txn_id text;
begin
  select * into v_profile
  from public.profiles
  where id = auth.uid() and active
    and role in ('admin', 'manager', 'cashier');

  if not found then raise exception 'Not authorized to process payments'; end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then raise exception 'Order not found'; end if;
  if v_order.payment_status = 'paid' then raise exception 'Order has already been paid'; end if;

  if p_payment_method = 'cash' then
    v_change := p_amount_given - v_order.total;
    if v_change < 0 then raise exception 'Amount given is less than order total'; end if;
  else
    v_change := 0;
  end if;

  select count(*) into v_txn_count from public.transactions;
  v_txn_id := 'txn-' || to_char(extract(epoch from clock_timestamp()) * 1000, 'FM9999999999999');

  insert into public.transactions (
    id, order_id, order_number, cashier_id, cashier_name,
    amount, method, amount_given, change, status, receipt_number
  ) values (
    v_txn_id,
    v_order.id,
    v_order.order_number,
    v_profile.id,
    v_profile.name,
    v_order.total,
    p_payment_method,
    case when p_payment_method = 'cash' then p_amount_given else v_order.total end,
    v_change,
    'paid',
    'RCP-' || lpad((v_txn_count + 1)::text, 4, '0')
  ) returning * into v_transaction;

  update public.orders
  set status = 'completed',
      payment_status = 'paid',
      payment_method = p_payment_method
  where id = v_order.id;

  if v_order.table_id is not null then
    update public.tables set status = 'available' where id = v_order.table_id;
  end if;

  return v_transaction;
end;
$$;

alter publication supabase_realtime add table public.orders, public.order_items,
  public.tables, public.inventory, public.events, public.transactions;
