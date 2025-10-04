/*
  # Hospital Order Management System Database Schema

  ## Overview
  Creates the database structure for a hospital order management system where
  doctors create treatment orders for patients and nurses track completion.

  ## New Tables
  
  ### 1. `doctors`
    - `id` (uuid, primary key) - Unique identifier for each doctor
    - `ad_soyad` (text) - Doctor's full name
    - `created_at` (timestamptz) - Record creation timestamp
  
  ### 2. `patients`
    - `id` (uuid, primary key) - Unique identifier for each patient
    - `ad_soyad` (text) - Patient's full name
    - `oda_no` (text) - Room number
    - `doktor_id` (uuid, foreign key) - Reference to assigned doctor
    - `created_at` (timestamptz) - Record creation timestamp
  
  ### 3. `orders`
    - `id` (uuid, primary key) - Unique identifier for each order
    - `hasta_id` (uuid, foreign key) - Reference to patient
    - `doktor_id` (uuid, foreign key) - Reference to doctor who created order
    - `ilaclar` (text) - Medication instructions
    - `serum` (text) - IV fluid instructions
    - `kontroller` (text) - Monitoring/check times
    - `notlar` (text) - Additional notes for nurses
    - `tamamlanan_gorevler` (jsonb) - Array of completed tasks
    - `created_at` (timestamptz) - Order creation timestamp
  
  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Public access policies for demo purposes (can be restricted with auth later)
  
  ## Notes
  - Uses Turkish field names as requested (ad_soyad, oda_no, etc.)
  - JSONB type for flexible task tracking
  - Timestamps for audit trail
  - Foreign key constraints maintain data integrity
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_soyad text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_soyad text NOT NULL,
  oda_no text NOT NULL,
  doktor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hasta_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doktor_id uuid REFERENCES doctors(id) ON DELETE SET NULL NOT NULL,
  ilaclar text DEFAULT '',
  serum text DEFAULT '',
  kontroller text DEFAULT '',
  notlar text DEFAULT '',
  tamamlanan_gorevler jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create public access policies for demo (can be restricted with auth later)
CREATE POLICY "Allow public read access to doctors"
  ON doctors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to doctors"
  ON doctors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to patients"
  ON patients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to patients"
  ON patients FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to patients"
  ON patients FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to orders"
  ON orders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to orders"
  ON orders FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to orders"
  ON orders FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_doktor_id ON patients(doktor_id);
CREATE INDEX IF NOT EXISTS idx_orders_hasta_id ON orders(hasta_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);