// lib/getUsername.ts
import { supabase } from './supabaseClient'

export async function getUsername(): Promise<string | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching username:', error)
    return null
  }

  return data.username
}
