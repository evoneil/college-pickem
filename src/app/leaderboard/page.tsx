'use client'

import { useState } from 'react'
import WeeklyLeaderboard from '@/components/WeeklyLeaderboard'
import OverallLeaderboard from '@/components/OverallLeaderboard'
import clsx from 'clsx'

export default function LeaderboardPage() {
  const [view, setView] = useState<'weekly' | 'overall'>('weekly')

  return (
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
          This Week
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

      {view === 'weekly' ? <WeeklyLeaderboard /> : <OverallLeaderboard />}
    </div>
  )
}
