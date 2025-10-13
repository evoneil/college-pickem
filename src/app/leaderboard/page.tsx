'use client'

import { useEffect, useState } from 'react'
import WeeklyLeaderboard from '@/components/WeeklyLeaderboard'
import OverallLeaderboard from '@/components/OverallLeaderboard'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '@/components/AuthGate'
import clsx from 'clsx'
import { getCurrentWeek } from '@/lib/getCurrentWeek'

export default function LeaderboardPage() {
  const [view, setView] = useState<'weekly' | 'overall'>('weekly')
  const [userId, setUserId] = useState<string | null>(null)
  const [currentWeekId, setCurrentWeekId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) setUserId(session.user.id)

      const weekId = await getCurrentWeek()
      setCurrentWeekId(weekId)
    }

    init()
  }, [])

  return (
    <AuthGate>
      <div className="px-4 py-8 text-white">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView('weekly')}
            className={clsx(
              'px-4 py-2 rounded font-medium transition',
              view === 'weekly'
                ? 'bg-[#403D4F] border border-white text-white'
                : 'bg-zinc-800 border border-[#504E57] hover:bg-zinc-700 text-white'
            )}
          >
            Weekly
          </button>
          {/* <button
            onClick={() => setView('overall')}
            className={clsx(
              'px-4 py-2 rounded font-medium transition',
              view === 'overall'
                ? 'bg-[#403D4F] border border-white text-white'
                : 'bg-zinc-800 border border-[#504E57] hover:bg-zinc-700 text-white'
            )}
          >
            Overall
          </button> */}
        </div>

        {view === 'weekly' && (
          <>
            {currentWeekId !== null ? (
              <WeeklyLeaderboard weekId={currentWeekId} />
            ) : (
              <p>Loading current week...</p>
            )}
          </>
        )}
        {view === 'overall' && <OverallLeaderboard />}
      </div>
    </AuthGate>
  )
}
