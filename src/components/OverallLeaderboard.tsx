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

      const ranked = rows
        .sort((a, b) => b.total - a.total)
        .map((u, i) => ({ ...u, rank: i + 1 }))

      setUsers(ranked)
    }

    load()
  }, [])

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-[#3F1D00] border border-[#FFBF47] text-white'
      case 2:
        return 'bg-[#001B26] border border-[#9AE2FF] text-white'
      case 3:
        return 'bg-[#260C00] border border-[#FFAA82] text-white'
      default:
        return 'bg-[#24232B] border border-[#504E57] text-white'
    }
  }

  return (
    <div>
      <h1 className="text-xl mb-6">Overall Leaderboard</h1>

      <div className="space-y-2">
        {users.map((u) => {
          const isCurrentUser = u.id === currentUserId

          return (
            <div
              key={u.id}
              className={clsx(
                'rounded-xl pr-4 pl-2 py-2 flex border items-center justify-between transition',
                isCurrentUser ? 'border-[#4D4B5B]' : 'border-[#24232B]'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'flex justify-center text-xl py-1 w-10 font-bold rounded-lg',
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
              <div className="text-white font-bold text-xxl tracking-wide whitespace-nowrap">
                {u.total} PTS
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
