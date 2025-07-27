'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const redirectToCurrentWeek = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id
      if (!uid) return

      const today = new Date().toISOString()

      const { data: weeks, error } = await supabase
        .from('weeks')
        .select('id, start_date, end_date')

      if (!weeks || error) return

      const currentWeek = weeks.find((week) => {
        return new Date(week.start_date) <= new Date() &&
               new Date(week.end_date) >= new Date()
      })

      if (currentWeek) {
        router.push(`/week/${currentWeek.id}`)
      }
    }

    redirectToCurrentWeek()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-xl">Loading picks…</h1>
    </main>
  )
}
