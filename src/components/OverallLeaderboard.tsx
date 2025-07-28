'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import clsx from 'clsx'

export default function OverallLeaderboard() {
  const [users, setUsers] = useState<{ username: string; total: number }[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.from('profiles').select('id, username')
      if (!userData) return

      const rows: { username: string; total: number }[] = []

      for (const user of userData) {
        const { data: picks } = await supabase
          .from('picks')
          .select('game_id, selected_team_id, double_down, game:game_id (winner_id, difficulty)')
          .eq('user_id', user.id)

        if (!picks) continue

        let total = 0
        for (const pick of picks) {
          const game = Array.isArray(pick.game) ? pick.game[0] : pick.game
          if (!game || !game.winner_id) continue

          const correct = pick.selected_team_id === game.winner_id
          const basePoints = game.difficulty || 0

          if (correct) {
            total += pick.double_down ? basePoints * 2 : basePoints
          } else if (pick.double_down) {
            total -= basePoints
          }
        }

        rows.push({ username: user.username, total })
      }

      rows.sort((a, b) => b.total - a.total)
      setUsers(rows)
    }

    load()
  }, [])

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400 text-black'
      case 2:
        return 'bg-blue-200 text-black'
      case 3:
        return 'bg-orange-400 text-black'
      default:
        return 'bg-neutral-700 text-white'
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Overall Leaderboard</h1>

      <div className="space-y-2">
        {users.map((u, i) => (
          <div
            key={u.username}
            className="bg-neutral-800 rounded-xl px-4 py-3 flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'text-sm font-bold px-2 py-1 rounded',
                  getRankStyle(i + 1)
                )}
              >
                {i + 1}
              </div>
              <p className="text-white text-sm leading-snug break-words max-w-xs sm:max-w-sm">
                {u.username}
              </p>
            </div>
            <div className="text-white font-bold italic text-sm tracking-wide whitespace-nowrap">
              {u.total} PTS
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
