'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import clsx from 'clsx'

type UserRow = {
  id: string
  username: string
  total: number
  rank: number
}

export default function OverallLeaderboard() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id ?? null
      setCurrentUserId(uid)

      const { data: userData } = await supabase.from('profiles').select('id, username')
      if (!userData) return

      const rows: Omit<UserRow, 'rank'>[] = []

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

        rows.push({ id: user.id, username: user.username, total })
      }

      // Sort and assign ranks before bumping current user
      const ranked = rows
        .sort((a, b) => b.total - a.total)
        .map((u, i) => ({ ...u, rank: i + 1 }))

      // Move current user to top (without affecting their rank)
      const sorted =
        uid !== null
          ? [
              ...ranked.filter((u) => u.id === uid),
              ...ranked.filter((u) => u.id !== uid),
            ]
          : ranked

      setUsers(sorted)
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
      <h1 className="text-2xl font-bold mb-6">Overall Leaderboard</h1>

      <div className="space-y-2">
        {users.map((u) => {
          const isCurrentUser = u.id === currentUserId

          return (
            <div
              key={u.id}
              className={clsx(
                'rounded-xl px-4 py-3 flex items-start justify-between transition',
                isCurrentUser ? 'bg-zinc-800/50' : 'bg-neutral-800'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    'text-sm font-bold px-2 py-1 rounded',
                    getRankStyle(u.rank)
                  )}
                >
                  {u.rank}
                </div>
                <p className="text-white text-sm leading-snug break-words max-w-xs sm:max-w-sm">
                  {u.username}
                  {isCurrentUser && ' (you)'}
                </p>
              </div>
              <div className="text-white font-bold italic text-sm tracking-wide whitespace-nowrap">
                {u.total} PTS
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
