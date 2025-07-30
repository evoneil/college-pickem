'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function HomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      if (profile?.username) {
        router.replace('/picks')
      } else {
        router.replace('/setup-username')
      }
    }

    redirect()
  }, [router])

  return null
}
