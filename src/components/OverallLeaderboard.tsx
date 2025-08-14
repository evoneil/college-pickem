'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

type UserRow = {
  id: string
  username: string
  total: number
  correct: number
  accuracy: number
  rank: number
}

export default function OverallLeaderboard() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      // Get session to highlight current user
      const sessionRes = await fetch('/api/auth/session')
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        setCurrentUserId(sessionData?.user?.id ?? null)
      }

      // Fetch precomputed leaderboard from API
      const res = await fetch('/api/overall-leaderboard')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
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
              <div className="flex items-center gap-4 text-white font-bold text-xxl tracking-wide whitespace-nowrap">
                <span className="text-sm text-gray-400">{u.accuracy}% ACC</span>
                <span>{u.total} PTS</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
