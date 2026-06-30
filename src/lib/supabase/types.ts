export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  photo_url: string | null;
  discount: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuVariation {
  id: string;
  menu_item_id: string;
  name: string;
  options: VariationOption[];
}

export interface VariationOption {
  name: string;
  price_add: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stock_qty: number;
  min_stock: number;
  created_at: string;
}

export interface IngredientPriceHistory {
  id: string;
  ingredient_id: string;
  price: number;
  recorded_at: string;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  quantity: number;
}

export interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  username: string;
  role: "owner" | "karyawan";
  active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  whatsapp: string | null;
  created_at: string;
}

export interface MenuItemRow extends MenuItem {
  categories: Pick<Category, "id" | "name"> | null;
  recipes: Array<
    Recipe & { ingredients: Pick<Ingredient, "id" | "name" | "unit"> | null }
  >;
  menu_variations: MenuVariation[];
}

export type StockStatus = "aman" | "menipis" | "habis";

export type OrderStatus = "pending" | "diproses" | "selesai";

export interface Transaction {
  id: string;
  customer_id: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  admin_fee_rate: number;
  admin_fee_amount: number;
  total: number;
  payment_method: string | null;
  amount_paid: number;
  change_amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Promo {
  id: string;
  code: string;
  discount_type: "nominal" | "persentase";
  discount_value: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  logo_url: string | null;
  contact: string | null;
  wa_message_template: string;
  gmaps_link: string | null;
  kitchen_mode: boolean;
  tax_enabled: boolean;
  tax_rate: number;
  admin_fee_enabled: boolean;
  admin_fee_type: "nominal" | "persentase";
  admin_fee_value: number;
  printer_type: string | null;
  paper_width: number;
  auto_print: boolean;
}

export interface QRTable {
  id: string;
  label: string;
  table_number: number;
  qr_code: string;
  created_at: string;
}
