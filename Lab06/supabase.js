import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vdimnldttlxudqswbjzn.supabase.co'
const supabaseKey = 'your-anon-key-here' // Replace with your Supabase anon/public key from dashboard (Settings > API > public anon key - safe for client)

export const supabase = createClient(supabaseUrl, supabaseKey)

