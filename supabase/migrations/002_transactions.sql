create table transactions (
  id uuid default uuid_generate_v4() primary key,
  subtotal integer not null,
  tax_rate numeric not null default 0.11,
  tax_amount integer not null default 0,
  admin_fee_rate numeric not null default 0,
  admin_fee_amount integer not null default 0,
  total integer not null,
  payment_method text not null check (payment_method in ('cash', 'qris', 'transfer')),
  amount_paid integer,
  change_amount integer,
  status text not null default 'completed',
  created_at timestamptz default now()
);

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

create or replace function deduct_stock(
  p_ingredient_id uuid,
  p_amount numeric
) returns void as $$
begin
  update ingredients
  set stock_qty = greatest(0, stock_qty - p_amount)
  where id = p_ingredient_id;
end;
$$ language plpgsql security definer;

alter table transactions enable row level security;
alter table transaction_items enable row level security;

create policy "Allow all on transactions" on transactions for all using (true) with check (true);
create policy "Allow all on transaction_items" on transaction_items for all using (true) with check (true);
