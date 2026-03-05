import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl =         "sb_publishable_OZnvc-_K6xM_6OCS-tYAPw_mbXBRs9j";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaW1ubGR0dGx4dWRxc3dianpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjE4ODMsImV4cCI6MjA4NzAzNzg4M30.-pM_H5V7vxqzPCH9mqL-MvPAFhPAOidEmF5wmc-FlyY";

export const supabase = createClient(supabaseUrl, supabaseKey);