javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajuovvjuglqpkdlkzxsc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdW92dmp1Z2xxcGtkbGt6eHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1Nzk3NjgsImV4cCI6MjA3NTE1NTc2OH0.K5BtZiuQmWv3g8ks-vPdP-Jc77BaJnleEVfo-HgGGPY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
