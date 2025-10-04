import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Doctor = {
  id: string;
  ad_soyad: string;
  created_at: string;
};

export type Patient = {
  id: string;
  ad_soyad: string;
  oda_no: string;
  doktor_id: string | null;
  created_at: string;
  doctors?: Doctor;
};

export type Order = {
  id: string;
  hasta_id: string;
  doktor_id: string;
  ilaclar: string;
  serum: string;
  kontroller: string;
  notlar: string;
  tamamlanan_gorevler: string[];
  created_at: string;
  patients?: Patient;
  doctors?: Doctor;
};
