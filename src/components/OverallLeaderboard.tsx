'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import clsx from 'clsx'

type UserRow = {
  id: string
  username: string
  total: number
  correct: number
  accuracy: number // integer percent (0–100) from the API
  rank: number
}

export default function OverallLeaderboard() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        // keep your current-user highlight behavior
        const { data: sessionData } = await supabase.auth.getSession()
        const uid = sessionData?.session?.user?.id ?? null
        setCurrentUserId(uid)

        // fetch array from the API (no logic changes)
        const res = await fetch('/api/overall-leaderboard', { cache: 'no-store' })
        const json = await res.json().catch(() => null)
        if (!res.ok || !Array.isArray(json)) {
          throw new Error((json && json.error) || `HTTP ${res.status}`)
        }
        setUsers(json as UserRow[])
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    })()
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

  if (loading) return <div className="p-6">Loading…</div>
  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 text-red-500">
        {error}{' '}
        <a className="underline" href="/api/overall-leaderboard" target="_blank">
          open API
        </a>
      </div>
    )
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
              {/* Left: rank badge + username */}
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

              {/* Right: points & accuracy (exactly your old visual) */}
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
