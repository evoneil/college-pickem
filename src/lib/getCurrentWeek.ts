// lib/getCurrentWeek.ts
import { supabase } from './supabaseClient'

export async function getCurrentWeek(): Promise<number | null> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('weeks')
    .select('id, start_date, end_date')
    .lte('start_date', now)
    .gte('end_date', now)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching current week:', error)
    return null
  }

  return data?.id ?? null
}
