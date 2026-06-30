create extension if not exists "uuid-ossp";

create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamptz default now()
);

create table menu_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  price integer not null,
  photo_url text,
  discount integer default 0 check (discount >= 0 and discount <= 100),
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_menu_items_category on menu_items(category_id);
create index idx_menu_items_active on menu_items(is_active);

create table menu_variations (
  id uuid default uuid_generate_v4() primary key,
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  name text not null,
  options jsonb not null default '[]'::jsonb
);

create index idx_menu_variations_item on menu_variations(menu_item_id);

create table ingredients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  unit text not null,
  stock_qty numeric not null default 0,
  min_stock numeric not null default 0,
  created_at timestamptz default now()
);

create table ingredient_price_history (
  id uuid default uuid_generate_v4() primary key,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  price numeric not null,
  recorded_at timestamptz default now()
);

create index idx_price_history_ingredient on ingredient_price_history(ingredient_id);
create index idx_price_history_date on ingredient_price_history(recorded_at desc);

create table recipes (
  id uuid default uuid_generate_v4() primary key,
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  quantity numeric not null,
  constraint recipes_menu_ingredient unique(menu_item_id, ingredient_id)
);

create table employees (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  username text unique not null,
  role text not null default 'karyawan' check (role in ('owner', 'karyawan')),
  active boolean default true,
  created_at timestamptz default now()
);

create table customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  whatsapp text,
  created_at timestamptz default now()
);

create table transactions (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id) on delete set null,
  subtotal integer not null default 0,
  tax_rate integer not null default 0,
  tax_amount integer not null default 0,
  admin_fee_rate integer not null default 0,
  admin_fee_amount integer not null default 0,
  total integer not null default 0,
  payment_method text,
  amount_paid integer not null default 0,
  change_amount integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'diproses', 'selesai')),
  created_at timestamptz default now()
);

create index idx_transactions_status on transactions(status);
create index idx_transactions_customer on transactions(customer_id);

create table transaction_items (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid not null references transactions(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name text not null,
  price integer not null,
  quantity integer not null,
  subtotal integer not null
);

create index idx_transaction_items_tx on transaction_items(transaction_id);

create table promos (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  discount_type text not null default 'nominal' check (discount_type in ('nominal', 'persentase')),
  discount_value integer not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'SIPI',
  logo_url text,
  contact text,
  wa_message_template text default 'Terima kasih telah berbelanja!',
  gmaps_link text,
  kitchen_mode boolean default false,
  tax_enabled boolean default false,
  tax_rate integer not null default 11,
  admin_fee_enabled boolean default false,
  admin_fee_type text not null default 'persentase' check (admin_fee_type in ('nominal', 'persentase')),
  admin_fee_value integer not null default 0,
  printer_type text,
  paper_width integer default 80,
  auto_print boolean default false
);

create table qr_tables (
  id uuid default uuid_generate_v4() primary key,
  label text not null,
  table_number integer not null,
  qr_code text not null,
  created_at timestamptz default now()
);

alter table categories enable row level security;
alter table menu_items enable row level security;
alter table menu_variations enable row level security;
alter table ingredients enable row level security;
alter table ingredient_price_history enable row level security;
alter table recipes enable row level security;
alter table employees enable row level security;
alter table customers enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table promos enable row level security;
alter table store_settings enable row level security;
alter table qr_tables enable row level security;

create policy "Allow all on categories" on categories for all using (true) with check (true);
create policy "Allow all on menu_items" on menu_items for all using (true) with check (true);
create policy "Allow all on menu_variations" on menu_variations for all using (true) with check (true);
create policy "Allow all on ingredients" on ingredients for all using (true) with check (true);
create policy "Allow all on ingredient_price_history" on ingredient_price_history for all using (true) with check (true);
create policy "Allow all on recipes" on recipes for all using (true) with check (true);
create policy "Allow all on employees" on employees for all using (true) with check (true);
create policy "Allow all on customers" on customers for all using (true) with check (true);
create policy "Allow all on transactions" on transactions for all using (true) with check (true);
create policy "Allow all on transaction_items" on transaction_items for all using (true) with check (true);
create policy "Allow all on promos" on promos for all using (true) with check (true);
create policy "Allow all on store_settings" on store_settings for all using (true) with check (true);
create policy "Allow all on qr_tables" on qr_tables for all using (true) with check (true);
