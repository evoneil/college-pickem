'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Overall Leaderboard</h1>

      <div className="overflow-auto rounded-xl border border-zinc-800">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-3 py-2 border-b border-zinc-700 text-left">Rank</th>
              <th className="px-3 py-2 border-b border-zinc-700 text-left">User</th>
              <th className="px-3 py-2 border-b border-zinc-700 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.username} className="hover:bg-zinc-800 transition">
                <td className="px-3 py-2 border-b border-zinc-800">{i + 1}</td>
                <td className="px-3 py-2 border-b border-zinc-800 font-medium">{u.username}</td>
                <td className="px-3 py-2 border-b border-zinc-800 text-center font-semibold">{u.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
