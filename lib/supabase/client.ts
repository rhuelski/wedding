import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { WeddingPhoto } from '@/lib/photos'

type Database = { public: { Tables: { photos: { Row: WeddingPhoto; Insert: Omit<WeddingPhoto, 'id' | 'created_at'>; Update: Partial<WeddingPhoto> } } } }
let browserClient: SupabaseClient<Database> | undefined

export function createBrowserClient() {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase is not configured for this project.')
    browserClient = createClient<Database>(url, key)
  }
  return browserClient
}
