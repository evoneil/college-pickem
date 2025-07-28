'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getUserScoreForWeek } from '@/lib/getUserScoreForWeek'

type User = {
  id: string
  username: string
}

type Week = {
  id: number
}

type Row = {
  username: string
  weekScores: number[]
  total: number
}

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([])
  const [weeks, setWeeks] = useState<Week[]>([])

  useEffect(() => {
    const loadLeaderboard = async () => {
      const { data: users } = await supabase.from('profiles').select('id, username')
      const { data: weeksData } = await supabase.from('weeks').select('id').order('id')

      if (!users || !weeksData) return

      setWeeks(weeksData)

      const leaderboard: Row[] = []

      for (const user of users) {
        const weekScores: number[] = []

        for (const week of weeksData) {
          const score = await getUserScoreForWeek(user.id, week.id)
          weekScores.push(score)
        }

        leaderboard.push({
          username: user.username,
          weekScores,
          total: weekScores.reduce((a, b) => a + b, 0),
        })
      }

      setRows(leaderboard)
    }

    loadLeaderboard()
  }, [])

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard</h1>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left px-2 py-1 border-b border-zinc-700">User</th>
              {weeks.map((w) => (
                <th key={w.id} className="text-center px-2 py-1 border-b border-zinc-700">
                  W{w.id}
                </th>
              ))}
              <th className="text-center px-2 py-1 border-b border-zinc-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .sort((a, b) => b.total - a.total)
              .map((row) => (
                <tr key={row.username}>
                  <td className="px-2 py-1 border-b border-zinc-800 font-semibold">{row.username}</td>
                  {row.weekScores.map((s, i) => (
                    <td key={i} className="text-center px-2 py-1 border-b border-zinc-800">{s}</td>
                  ))}
                  <td className="text-center px-2 py-1 border-b border-zinc-800 font-bold">{row.total}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
