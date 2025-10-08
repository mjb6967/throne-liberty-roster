import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxyrfjoivwkbialytccf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4eXJmam9pdndrYmlhbHl0Y2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzQ1MzYsImV4cCI6MjA3NTQ1MDUzNn0.9Q07c1W6q5koDNlTphPFB7SwGlTvU6OsmdYMSgdcJuc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
