// app/leaderboard/page.tsx
'use client'

import { useState } from 'react'
import WeeklyLeaderboard from '@/components/WeeklyLeaderboard'
import OverallLeaderboard from '@/components/OverallLeaderboard'

export default function LeaderboardPage() {
  const [view, setView] = useState<'weekly' | 'overall'>('weekly')

  console.log({ WeeklyLeaderboard, OverallLeaderboard })

  return (
    <div className="p-6 text-white">
      <div className="mb-4">
        <label className="mr-2">View:</label>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as 'weekly' | 'overall')}
          className="bg-zinc-800 border border-zinc-600 text-white px-2 py-1 rounded"
        >
          <option value="weekly">This Week</option>
          <option value="overall">Overall</option>
        </select>
      </div>

      {view === 'weekly' ? <WeeklyLeaderboard /> : <OverallLeaderboard />}
    </div>
  )
}
