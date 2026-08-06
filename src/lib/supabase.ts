/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your AI Studio Secrets panel.');
}

if (!supabaseUrl.startsWith('http')) {
  console.warn('Invalid VITE_SUPABASE_URL provided. It must start with http:// or https://');
  supabaseUrl = 'https://placeholder.supabase.co';
}

// Clean up the URL if the user accidentally pasted the REST URL or added trailing slashes
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
supabaseUrl = supabaseUrl.replace(/\/$/, '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
