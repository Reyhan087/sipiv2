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

alter table categories enable row level security;
alter table menu_items enable row level security;
alter table menu_variations enable row level security;
alter table ingredients enable row level security;
alter table ingredient_price_history enable row level security;
alter table recipes enable row level security;
alter table employees enable row level security;

create policy "Allow all on categories" on categories for all using (true) with check (true);
create policy "Allow all on menu_items" on menu_items for all using (true) with check (true);
create policy "Allow all on menu_variations" on menu_variations for all using (true) with check (true);
create policy "Allow all on ingredients" on ingredients for all using (true) with check (true);
create policy "Allow all on ingredient_price_history" on ingredient_price_history for all using (true) with check (true);
create policy "Allow all on recipes" on recipes for all using (true) with check (true);
create policy "Allow all on employees" on employees for all using (true) with check (true);
