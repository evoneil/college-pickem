'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // 🚫 Not logged in → go to /login
      if (!session) {
        router.replace('/login')
        return
      }

      // 🔍 Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      // 🚫 No username → go to /setup-username
      if (!profile || error || !profile.username) {
        router.replace('/setup-username')
        return
      }

      // ✅ All good — allow page to render
      setLoading(false)
    }

    check()
  }, [router])

  if (loading) return null // or a loading spinner

  return <>{children}</>
}
