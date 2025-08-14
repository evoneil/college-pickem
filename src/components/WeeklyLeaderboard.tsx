'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getUserScoreForWeek } from '@/lib/getUserScoreForWeek'
import { getCurrentWeek } from '@/lib/getCurrentWeek'
import clsx from 'clsx'

const ENABLE_WEEK_FILTERING = true // Toggle this on/off to filter out future weeks

type Team = {
  id: string
  name: string
  short_name: string
  logo_url: string
}

type Game = {
  id: string
  difficulty: number
  winner_id: string | null
  kickoff_time: string
  home_team: Team
  away_team: Team
}

type Pick = {
  game_id: string
  selected_team_id: string
  double_down: boolean
}

type UserRow = {
  id: string
  username: string
  picks: Pick[]
  total: number
}

type Props = {
  weekId: number
}

export default function WeeklyLeaderboard({ weekId }: Props) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [weeks, setWeeks] = useState<{ id: number }[]>([])
  const [selectedWeekId, setSelectedWeekId] = useState<number>(weekId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentWeekId, setCurrentWeekId] = useState<number | null>(null)
  const [maxWeeklyScore, setMaxWeeklyScore] = useState<number | null>(null)


  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id ?? null
      setCurrentUserId(uid)

      const [weekFromDB, { data: weeksData }] = await Promise.all([
        getCurrentWeek(),
        supabase.from('weeks').select('id, start_date, end_date').order('id'),
      ])
      setCurrentWeekId(weekFromDB)

      if (weeksData) {
        const now = new Date()

        const filtered = ENABLE_WEEK_FILTERING
          ? weeksData.filter((week) => {
            const start = new Date(week.start_date)
            const end = new Date(week.end_date)
            return (now >= start && now <= end) || now > end
          })
          : weeksData

        const currentIndex = filtered.findIndex((w) => w.id === weekFromDB)
        const [currentWeek] = filtered.splice(currentIndex, 1)
        const reversed = filtered.sort((a, b) => b.id - a.id)
        setWeeks([currentWeek, ...reversed])
      }

      const { data: gameData } = await supabase
        .from('games')
        .select(`
          id,
          difficulty,
          winner_id,
          kickoff_time,
          home_team:home_team_id (id, name, short_name, logo_url),
          away_team:away_team_id (id, name, short_name, logo_url)
        `)
        .eq('week', selectedWeekId)

      if (!gameData) return

      const unwrappedGames: Game[] = gameData.map((g: any) => {
        const home = Array.isArray(g.home_team) ? g.home_team[0] : g.home_team
        const away = Array.isArray(g.away_team) ? g.away_team[0] : g.away_team

        return {
          id: g.id,
          difficulty: g.difficulty,
          winner_id: g.winner_id,
          kickoff_time: g.kickoff_time,
          home_team: home,
          away_team: away,
        }
      })

      setGames(unwrappedGames.sort((a, b) => a.difficulty - b.difficulty))

      // 🔄 Call the backend API for the leaderboard
      const res = await fetch(`/api/leaderboard?week=${selectedWeekId}`)
      const leaderboardData = await res.json()

      // Reorder so current user is at the top
      const reordered =
        uid != null
          ? [
            ...leaderboardData.filter((u: UserRow) => u.id === uid),
            ...leaderboardData.filter((u: UserRow) => u.id !== uid),
          ]
          : leaderboardData

      const maxScore = Math.max(...leaderboardData.map((u: UserRow) => u.total))

      setUsers(reordered)
      setMaxWeeklyScore(maxScore)


      const { data: userData } = await supabase.from('profiles').select('id, username')
      if (!userData) return


      setUsers(reordered)

    }

    load()
  }, [selectedWeekId])

  return (
    <div>
      <h1 className="text-xl mb-6">Weekly Leaderboard</h1>

      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max px-1 mb-4">
          {weeks.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWeekId(w.id)}
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium transition border whitespace-nowrap',
                selectedWeekId === w.id
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700'
              )}
            >
              {currentWeekId === w.id ? `This week (${w.id})` : `Week ${w.id}`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-zinc-800">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-zinc-900">
            <tr>
              <th className="sticky left-0 bg-zinc-900 px-3 py-2 border-b border-zinc-700 z-10 text-left">
                User
              </th>
              <th className="text-center px-3 py-2 border-b border-zinc-700">Total</th>
              {games.map((g) => (
                <th
                  key={g.id}
                  className="text-center px-3 py-2 border-b border-zinc-700 whitespace-nowrap"
                >
                  <div className="font-semibold text-sm">{g.difficulty} PT</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {g.home_team.short_name} @ {g.away_team.short_name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isCurrentUser = u.id === currentUserId
              return (
                <tr
                  key={u.username}
                  className={clsx(
                    'transition even:bg-zinc-900 odd:bg-zinc-950',
                    isCurrentUser && 'bg-zinc-800/50'
                  )}
                >
                  <td
                    className={clsx(
                      'sticky left-0 bg-zinc-900 px-3 py-2 border-b border-zinc-800 font-medium z-10',
                      u.total === maxWeeklyScore && 'text-[#FFBF47]'
                    )}
                  >
                    {u.username}
                    {isCurrentUser && ' (you)'}
                  </td>

                  <td className="text-center px-3 py-2 border-b border-zinc-800 font-semibold">
                    {u.total}
                  </td>
                  {games.map((g) => {
                    const pick = u.picks.find((p) => p.game_id === g.id)
                    const hasStarted = new Date() >= new Date(g.kickoff_time)
                    const canReveal = isCurrentUser || hasStarted

                    if (!canReveal) {
                      return (
                        <td key={g.id} className="text-center px-3 py-2 border-b border-zinc-800">
                          <div className="flex items-center justify-center w-8 h-8 mx-auto">
                            <img
                              src="https://ynlmvzuedasovzaesjeq.supabase.co/storage/v1/object/public/graphics//icons-hidden.svg"
                              alt="Hidden pick"
                              className="w-8 h-8 opacity-50"
                            />
                          </div>
                        </td>
                      )
                    }

                    if (!pick) {
                      return (
                        <td key={g.id} className="text-center px-3 py-2 border-b border-zinc-800">
                          <div className="flex items-center justify-center w-8 h-8 mx-auto">-</div>
                        </td>
                      )
                    }

                    const pickedTeam =
                      g.home_team?.id === pick.selected_team_id
                        ? g.home_team
                        : g.away_team?.id === pick.selected_team_id
                          ? g.away_team
                          : null

                    const isCorrect = g.winner_id && pick.selected_team_id === g.winner_id
                    const isIncorrect = g.winner_id && pick.selected_team_id !== g.winner_id

                    return (
                      <td key={g.id} className="text-center px-3 py-2 border-b border-zinc-800">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center relative w-10 h-10">
                            {/* Glow behind logo */}
                            {(isCorrect || isIncorrect) && (
                              <div
                                className={clsx(
                                  'absolute rounded-full z-0',
                                  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                                  isCorrect && 'w-6 h-6 blur-md bg-[#5BFF92]',
                                  isIncorrect && 'w-8 h-8 blur-md bg-[#FF1846]'
                                )}
                              />
                            )}

                            {/* Logo */}
                            {pickedTeam?.logo_url ? (
                              <img
                                src={pickedTeam.logo_url}
                                alt={pickedTeam.name}
                                className="w-full h-full object-contain relative z-8"
                              />
                            ) : (
                              '❓'
                            )}

                            {/* DD tag */}
                            {pick.double_down && (
                              <img
                                src="https://ynlmvzuedasovzaesjeq.supabase.co/storage/v1/object/public/graphics/doubledown.svg"
                                alt="Double Down"
                                className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-4 z-8"
                              />
                            )}

                          </div>
                        </div>

                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
