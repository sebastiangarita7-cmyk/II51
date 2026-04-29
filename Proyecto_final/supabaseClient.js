//Este archivo guarda la conexión con Supabase.

const SUPABASE_URL = "https://cwclkfuxskjytnzjwkvw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Y2xrZnV4c2tqeXRuemp3a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODMwNDUsImV4cCI6MjA5MzA1OTA0NX0.vmijWUpicSbWOcenuxU-lETaaVdu89oSEoLa83mCpAs";

// Se crea el cliente de Supabase para poder usar auth, tablas e inserts.
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
