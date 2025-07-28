'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentWeek } from '@/lib/getCurrentWeek'

export default function PostAuthCheck() {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
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
        const currentWeekId = await getCurrentWeek()
        if (currentWeekId) {
          router.replace(`/week/${currentWeekId}`)
        } else {
          router.replace('/login')
        }
      } else {
        router.replace('/setup-username')
      }
    }

    check()
  }, [router])

  return null
}
