'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getUserScoreForWeek } from '@/lib/getUserScoreForWeek'
import clsx from 'clsx'

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

export default function WeeklyLeaderboard() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id ?? null
      setCurrentUserId(uid)

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
        .eq('week', 1)

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

      const { data: userData } = await supabase.from('profiles').select('id, username')
      if (!userData) return

      const rows: UserRow[] = []

      for (const user of userData) {
        const { data: picksData } = await supabase
          .from('picks')
          .select('game_id, selected_team_id, double_down')
          .eq('user_id', user.id)
          .in('game_id', unwrappedGames.map(g => g.id))

        const score = await getUserScoreForWeek(user.id, 1)

        rows.push({
          id: user.id,
          username: user.username,
          picks: picksData ?? [],
          total: score,
        })
      }

      const sortedRows = uid
        ? [
            ...rows.filter((u) => u.id === uid),
            ...rows.filter((u) => u.id !== uid),
          ]
        : rows

      setUsers(sortedRows)
    }

    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🏈 Week 1 Leaderboard</h1>

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
                  <div className="font-semibold text-sm">{g.difficulty} pts</div>
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
                  <td className="sticky left-0 bg-zinc-900 px-3 py-2 border-b border-zinc-800 font-medium z-10">
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
                          <div
                            className={clsx(
                              'relative w-8 h-8 rounded-full flex items-center justify-center',
                              isCorrect && 'before:absolute before:inset-0 before:rounded-full before:bg-green-500 before:opacity-20',
                              isIncorrect && 'before:absolute before:inset-0 before:rounded-full before:bg-red-500 before:opacity-20'
                            )}
                          >
                            {pickedTeam?.logo_url ? (
                              <img
                                src={pickedTeam.logo_url}
                                alt={pickedTeam.name}
                                className="w-full h-full object-contain relative z-10"
                              />
                            ) : (
                              '❓'
                            )}
                          </div>
                          {pick.double_down && (
                            <span className="text-xs text-red-500 font-bold mt-1">DD</span>
                          )}
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
