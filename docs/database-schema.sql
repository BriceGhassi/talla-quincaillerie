-- PostgreSQL schema for an offline-first quincaillerie management system.
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked');
CREATE TYPE location_type AS ENUM ('store', 'warehouse', 'workshop');
CREATE TYPE stock_movement_type AS ENUM (
  'opening_balance', 'purchase_receipt', 'sale', 'sale_return',
  'transfer_out', 'transfer_in', 'production_consume',
  'production_output', 'adjustment', 'stock_count_variance'
);
CREATE TYPE sale_status AS ENUM ('draft', 'completed', 'voided', 'returned', 'synced_pending_review');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'cancelled');
CREATE TYPE production_status AS ENUM ('draft', 'planned', 'released', 'in_progress', 'completed', 'costed', 'closed', 'cancelled');
CREATE TYPE sync_status AS ENUM ('accepted', 'rejected', 'conflict');

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  tax_identifier text,
  currency_code char(3) NOT NULL DEFAULT 'XAF',
  ohada_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  type location_type NOT NULL,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  code text NOT NULL,
  name text NOT NULL,
  public_key text,
  last_seen_at timestamptz,
  offline_allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  description text NOT NULL
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  default_location_id uuid REFERENCES locations(id),
  full_name text NOT NULL,
  email text,
  username text NOT NULL,
  password_hash text NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, username)
);

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id uuid REFERENCES users(id),
  employee_no text NOT NULL,
  full_name text NOT NULL,
  job_title text,
  hourly_rate numeric(14,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, employee_no)
);

CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  parent_id uuid REFERENCES product_categories(id),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  payment_terms_days integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  credit_limit numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  category_id uuid REFERENCES product_categories(id),
  primary_supplier_id uuid REFERENCES suppliers(id),
  sku text NOT NULL,
  barcode text,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'piece',
  is_manufactured boolean NOT NULL DEFAULT false,
  is_stocked boolean NOT NULL DEFAULT true,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  reorder_level numeric(14,3) NOT NULL DEFAULT 0,
  standard_cost numeric(14,2) NOT NULL DEFAULT 0,
  selling_price numeric(14,2) NOT NULL DEFAULT 0,
  version bigint NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, sku),
  UNIQUE (organization_id, barcode)
);

CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  product_id uuid NOT NULL REFERENCES products(id),
  movement_type stock_movement_type NOT NULL,
  quantity numeric(14,3) NOT NULL,
  unit_cost numeric(14,2) NOT NULL DEFAULT 0,
  reference_type text,
  reference_id uuid,
  occurred_at timestamptz NOT NULL,
  created_by uuid REFERENCES users(id),
  device_id uuid REFERENCES devices(id),
  sync_operation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_balance ON stock_movements (organization_id, location_id, product_id, occurred_at);

CREATE VIEW stock_balances AS
SELECT
  organization_id,
  location_id,
  product_id,
  SUM(quantity) AS quantity_on_hand,
  CASE WHEN SUM(quantity) = 0 THEN 0
       ELSE SUM(quantity * unit_cost) / NULLIF(SUM(quantity), 0)
  END AS average_cost
FROM stock_movements
GROUP BY organization_id, location_id, product_id;

CREATE TABLE stock_counts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  count_no text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  counted_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  counted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, count_no)
);

CREATE TABLE stock_count_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_count_id uuid NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  expected_quantity numeric(14,3) NOT NULL,
  counted_quantity numeric(14,3) NOT NULL,
  variance_quantity numeric(14,3) NOT NULL
);

CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  customer_id uuid REFERENCES customers(id),
  cashier_id uuid NOT NULL REFERENCES users(id),
  device_id uuid REFERENCES devices(id),
  receipt_no text NOT NULL,
  status sale_status NOT NULL DEFAULT 'completed',
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  discount_total numeric(14,2) NOT NULL DEFAULT 0,
  tax_total numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  occurred_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, receipt_no)
);

CREATE TABLE sale_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity numeric(14,3) NOT NULL,
  unit_price numeric(14,2) NOT NULL,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  line_total numeric(14,2) NOT NULL
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  sale_id uuid REFERENCES sales(id),
  customer_id uuid REFERENCES customers(id),
  supplier_id uuid REFERENCES suppliers(id),
  method text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency_code char(3) NOT NULL DEFAULT 'XAF',
  status payment_status NOT NULL DEFAULT 'paid',
  reference text,
  paid_at timestamptz NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shifts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  cashier_id uuid NOT NULL REFERENCES users(id),
  device_id uuid REFERENCES devices(id),
  opened_at timestamptz NOT NULL,
  closed_at timestamptz,
  opening_cash numeric(14,2) NOT NULL DEFAULT 0,
  expected_cash numeric(14,2),
  counted_cash numeric(14,2),
  variance numeric(14,2)
);

CREATE TABLE bills_of_material (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  finished_product_id uuid NOT NULL REFERENCES products(id),
  code text NOT NULL,
  name text NOT NULL,
  output_quantity numeric(14,3) NOT NULL DEFAULT 1,
  version bigint NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE TABLE bom_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bom_id uuid NOT NULL REFERENCES bills_of_material(id) ON DELETE CASCADE,
  component_product_id uuid NOT NULL REFERENCES products(id),
  quantity numeric(14,3) NOT NULL,
  scrap_percent numeric(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE production_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  bom_id uuid REFERENCES bills_of_material(id),
  finished_product_id uuid NOT NULL REFERENCES products(id),
  order_no text NOT NULL,
  status production_status NOT NULL DEFAULT 'draft',
  planned_quantity numeric(14,3) NOT NULL,
  produced_quantity numeric(14,3) NOT NULL DEFAULT 0,
  scrap_quantity numeric(14,3) NOT NULL DEFAULT 0,
  planned_start_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES users(id),
  version bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, order_no)
);

CREATE TABLE production_consumptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_order_id uuid NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  planned_quantity numeric(14,3) NOT NULL,
  actual_quantity numeric(14,3) NOT NULL DEFAULT 0,
  unit_cost numeric(14,2) NOT NULL DEFAULT 0
);

CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  employee_id uuid NOT NULL REFERENCES employees(id),
  production_order_id uuid REFERENCES production_orders(id),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  hours numeric(8,2),
  created_by uuid REFERENCES users(id)
);

CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  location_id uuid NOT NULL REFERENCES locations(id),
  order_no text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  ordered_at timestamptz,
  expected_at timestamptz,
  total numeric(14,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, order_no)
);

CREATE TABLE purchase_order_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity numeric(14,3) NOT NULL,
  unit_cost numeric(14,2) NOT NULL,
  received_quantity numeric(14,3) NOT NULL DEFAULT 0
);

CREATE TABLE accounting_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  account_no text NOT NULL,
  name text NOT NULL,
  ohada_class text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, account_no)
);

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  entry_no text NOT NULL,
  entry_date date NOT NULL,
  source_type text,
  source_id uuid,
  memo text,
  posted_by uuid REFERENCES users(id),
  posted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, entry_no)
);

CREATE TABLE journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounting_accounts(id),
  debit numeric(14,2) NOT NULL DEFAULT 0,
  credit numeric(14,2) NOT NULL DEFAULT 0,
  description text,
  CHECK (debit >= 0 AND credit >= 0),
  CHECK ((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
);

CREATE TABLE sync_operations (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  location_id uuid REFERENCES locations(id),
  device_id uuid REFERENCES devices(id),
  user_id uuid REFERENCES users(id),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  operation_type text NOT NULL,
  base_version bigint,
  payload jsonb NOT NULL,
  status sync_status NOT NULL,
  conflict_reason text,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text NOT NULL,
  UNIQUE (organization_id, idempotency_key)
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id uuid REFERENCES users(id),
  device_id uuid REFERENCES devices(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

