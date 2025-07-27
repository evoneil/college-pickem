'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import clsx from 'clsx'

type PickWithGame = {
  selected_team_id: string
  double_down: boolean
  game: {
    winner: string | null
    difficulty: number
    week: number
  } | null
}

type Week = {
  id: number
  number: number
  start_date: string
  end_date: string
}

type UserScore = {
  user_id: string
  username: string
  total: number
  weekly: { [weekNum: number]: number }
}

export default function OverallLeaderboard() {
  const [viewMode, setViewMode] = useState<'total' | 'weekly'>('total')
  const [weeks, setWeeks] = useState<Week[]>([])
  const [scores, setScores] = useState<UserScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)

      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, username')

      const { data: weeksData } = await supabase
        .from('weeks')
        .select('id, number, start_date, end_date')
        .order('number', { ascending: true })

      if (!users || !weeksData) {
        setLoading(false)
        return
      }

      const results: UserScore[] = []

      for (const user of users) {
        const { data: rawPicks } = await supabase
          .from('picks')
          .select(`
            selected_team_id,
            double_down,
            game:game_id (
              winner,
              difficulty,
              week
            )
          `)
          .eq('user_id', user.id)

        const picks = rawPicks as unknown as PickWithGame[]

        let total = 0
        const weeklyScores: { [weekNum: number]: number } = {}

        for (const pick of picks || []) {
          const game = pick.game
          if (!game) continue

          const correct = pick.selected_team_id === game.winner
          const base = game.difficulty || 0
          const week = game.week

          let score = 0
          if (correct) {
            score = pick.double_down ? base * 2 : base
          } else if (pick.double_down) {
            score = -base
          }

          total += score
          weeklyScores[week] = (weeklyScores[week] || 0) + score
        }

        results.push({
          user_id: user.id,
          username: user.username,
          total,
          weekly: weeklyScores
        })
      }

      results.sort((a, b) => b.total - a.total)

      setWeeks(weeksData)
      setScores(results)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="p-6 space-y-4 text-white">
      <h1 className="text-2xl font-extrabold italic">SCOREBOARD</h1>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setViewMode('total')}
          className={clsx(
            'px-4 py-2 rounded font-semibold',
            viewMode === 'total' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/50'
          )}
        >
          Total points
        </button>
        <button
          onClick={() => setViewMode('weekly')}
          className={clsx(
            'px-4 py-2 rounded font-semibold',
            viewMode === 'weekly' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/50'
          )}
        >
          Week by week
        </button>
      </div>

      {loading ? (
        <p className="text-white">Loading leaderboard...</p>
      ) : viewMode === 'total' ? (
        <div className="space-y-2">
          {scores.map((user, index) => (
            <div
              key={user.user_id}
              className="flex justify-between items-center bg-white/5 rounded px-4 py-2 text-white font-semibold"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={clsx(
                    'w-6 h-6 flex items-center justify-center text-sm font-bold rounded',
                    {
                      'bg-yellow-400 text-black': index === 0,
                      'bg-blue-400 text-black': index === 1,
                      'bg-orange-500 text-black': index === 2,
                      'bg-white/20': index > 2
                    }
                  )}
                >
                  {index + 1}
                </div>
                <div className="max-w-[150px] truncate">{user.username}</div>
              </div>
              <div className="text-right tabular-nums">{user.total} pts</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white text-sm border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="text-left px-2">User</th>
                <th className="text-right px-2">Total</th>
                {weeks.map((week) => (
                  <th key={week.id} className="text-right px-2 whitespace-nowrap">
                    Week {week.number}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.map((user) => (
                <tr key={user.user_id} className="bg-white/5 rounded">
                  <td className="px-2 font-semibold">{user.username}</td>
                  <td className="px-2 text-right">{user.total}</td>
                  {weeks.map((week) => (
                    <td key={week.id} className="px-2 text-right">
                      {user.weekly[week.number] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
