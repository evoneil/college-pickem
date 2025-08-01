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
      <div className="p-6 text-white">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView('weekly')}
            className={clsx(
              'px-4 py-2 rounded font-medium transition',
              view === 'weekly'
                ? 'bg-white text-black'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => setView('overall')}
            className={clsx(
              'px-4 py-2 rounded font-medium transition',
              view === 'overall'
                ? 'bg-white text-black'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            )}
          >
            Overall
          </button>
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
