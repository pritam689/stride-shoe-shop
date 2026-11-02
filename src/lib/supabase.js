import { createClient } from '@supabase/supabase-js'

// Only the public anon key is used here. Data access is protected by Row Level Security (see supabase/schema.sql).
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export const money = (n) => `$${Number(n).toFixed(2)}`
export const unitPrice = (p) => p.discount_price ?? p.price
