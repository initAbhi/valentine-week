import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcehzsbpnhhewwtekxjo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWh6c2JwbmhoZXd3dGVreGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDY0NjIsImV4cCI6MjA4NjE4MjQ2Mn0.8qNPD6IZqU-Qj0gz5ohi8iegERyLxrrJMw7O1LspK-s';

console.log('Supabase config:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length,
    envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
