
import { createClient } from '@supabase/supabase-js';

// In a real app, these come from process.env.
// For this environment, we'll assume they are handled by the context or skipped if offline.
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

/* 
SQL SCHEMA FOR SUPABASE:

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_card TEXT NOT NULL,
  email TEXT
);

CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial TEXT NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  device_id UUID REFERENCES devices(id),
  status TEXT NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checklist JSONB,
  signature TEXT,
  total_price DECIMAL(10,2)
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  cost DECIMAL(10,2),
  price DECIMAL(10,2)
);
*/
