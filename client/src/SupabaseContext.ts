import { createContext, useContext } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

export const SupabaseContext = createContext<SupabaseClient | null>(null)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === null) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
