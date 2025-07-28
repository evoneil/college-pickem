'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import clsx from 'clsx'

type Team = {
  id: string
  name: string
  short_name: string
  logo_url: string | null
  color: string
}

type Game = {
  id: string
  home_team: Team
  away_team: Team
  kickoff_time: string
  lock_time: string
  difficulty: number
}

type PickDraft = {
  game_id: string
  selected_team_id: string
  double_down: boolean
}

export default function WeekPicks() {
  const params = useParams()
  const router = useRouter()
  const weekId = parseInt(params.weekId as string, 10)

  const [games, setGames] = useState<Game[]>([])
  const [draftPicks, setDraftPicks] = useState<PickDraft[]>([])
  const [originalPicks, setOriginalPicks] = useState<PickDraft[]>([])
  const [showToast, setShowToast] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [weekLocked, setWeekLocked] = useState(false)

  const picksUnchanged = JSON.stringify(draftPicks) === JSON.stringify(originalPicks)

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id ?? null
      setUserId(uid)
      if (!uid) return

      const { data: weekData, error: weekError } = await supabase
        .from('weeks')
        .select('*')
        .eq('id', weekId)
        .single()

      if (weekError || !weekData) {
        router.push('/')
        return
      }

      const now = new Date()
      const start = new Date(weekData.start_date)
      const end = new Date(weekData.end_date)

      const isLockedOut = now < start
      setWeekLocked(isLockedOut)

      if (isLockedOut) return

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          id,
          home_team_id,
          away_team_id,
          kickoff_time,
          lock_time,
          difficulty,
          home_team:home_team_id (id, name, short_name, logo_url, color),
          away_team:away_team_id (id, name, short_name, logo_url, color)
        `)
        .eq('week', weekId)

      if (gameError || !gameData) return

      const cleanedGames: Game[] = gameData.map((g: any) => ({
        ...g,
        home_team: Array.isArray(g.home_team) ? g.home_team[0] : g.home_team,
        away_team: Array.isArray(g.away_team) ? g.away_team[0] : g.away_team,
      }))

      const sortedGames = cleanedGames.sort((a, b) => b.difficulty - a.difficulty)
      setGames(sortedGames)

      const gameIds = sortedGames.map((g) => g.id)

      const { data: picksData } = await supabase
        .from('picks')
        .select('*')
        .eq('user_id', uid)
        .in('game_id', gameIds)

      if (picksData) {
        const formatted = picksData.map((p) => ({
          game_id: p.game_id,
          selected_team_id: p.selected_team_id,
          double_down: p.double_down
        }))
        setDraftPicks(formatted)
        setOriginalPicks(formatted)
      }
    }
    init()
  }, [weekId])

  const updatePick = (game_id: string, selected_team_id: string) => {
    setDraftPicks((prev) => {
      const existing = prev.find((p) => p.game_id === game_id)
      if (existing) {
        return prev.map((p) =>
          p.game_id === game_id ? { ...p, selected_team_id } : p
        )
      } else {
        return [...prev, { game_id, selected_team_id, double_down: false }]
      }
    })
  }

  const toggleDoubleDown = (game_id: string) => {
    setDraftPicks((prev) => {
      return prev.map((p) => {
        if (p.game_id === game_id) {
          return { ...p, double_down: !p.double_down }
        } else {
          return { ...p, double_down: false }
        }
      })
    })
  }

  const savePicks = async () => {
    if (!userId || weekLocked) return

    const { error } = await supabase.from('picks').upsert(
      draftPicks.map((pick) => ({
        user_id: userId,
        game_id: pick.game_id,
        selected_team_id: pick.selected_team_id,
        double_down: pick.double_down,
        submitted_at: new Date().toISOString()
      })),
      { onConflict: 'user_id,game_id' }
    )

    if (!error) {
      setOriginalPicks(draftPicks)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } else {
      console.error(error)
    }
  }

  if (weekLocked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-center">This week is not available yet.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6">
      <h1 className="text-xl font-bold">WEEK {weekId} PICKS</h1>

      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md z-50 transition-opacity">
          ✅ Picks Saved!
        </div>
      )}

      {!userId ? (
        <div className="text-center text-red-500 font-semibold">You must be signed in to make picks.</div>
      ) : (
        <>
          <div className="md:static sticky top-0 z-30 bg-black py-2">
            <button
              onClick={savePicks}
              disabled={picksUnchanged}
              className={`w-full py-2 rounded-lg font-bold text-white transition-colors ${
                picksUnchanged ? 'bg-zinc-700 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              Save Picks
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => {
              const pick = draftPicks.find((p) => p.game_id === game.id)
              const selected_id = pick?.selected_team_id
              const isDoubleDown = pick?.double_down
              const isLocked = new Date() > new Date(game.lock_time)

              const date = new Date(game.kickoff_time)
              const dateStr = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
              const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

              return (
                <div key={game.id} className="bg-zinc-900 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>
                      {game.away_team.name} @ {game.home_team.name}
                    </span>
                    <span>{game.difficulty} PTS</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {dateStr}, {timeStr} {isLocked && '🔒'}
                  </div>

                  <div className="flex gap-2 mt-2">
                    {/* Away team button */}
                    <button
                      onClick={() => updatePick(game.id, game.away_team.id)}
                      disabled={isLocked}
                      className={clsx(
                        'flex items-center justify-center gap-2 rounded-md py-2 font-semibold text-white border border-zinc-700 transition-all overflow-hidden',
                        selected_id === game.away_team.id ? 'flex-[2]' : selected_id === game.home_team.id ? 'flex-[1]' : 'flex-1',
                        selected_id === game.away_team.id && 'ring-2 ring-white',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{
                        background:
                          selected_id === game.away_team.id
                            ? `radial-gradient(circle at center, ${game.away_team.color} 0%, #000000 100%)`
                            : undefined,
                      }}
                    >
                      {game.away_team.logo_url && (
                        <img src={game.away_team.logo_url} alt="" className="w-10 h-10 object-contain" />
                      )}
                      {selected_id !== game.home_team.id && game.away_team.name}
                    </button>

                    {/* Home team button */}
                    <button
                      onClick={() => updatePick(game.id, game.home_team.id)}
                      disabled={isLocked}
                      className={clsx(
                        'flex items-center justify-center gap-2 rounded-md py-2 font-semibold text-white border border-zinc-700 transition-all overflow-hidden',
                        selected_id === game.home_team.id ? 'flex-[2]' : selected_id === game.away_team.id ? 'flex-[1]' : 'flex-1',
                        selected_id === game.home_team.id && 'ring-2 ring-white',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{
                        background:
                          selected_id === game.home_team.id
                            ? `radial-gradient(circle at center, ${game.home_team.color} 0%, #000000 100%)`
                            : undefined,
                      }}
                    >
                      {game.home_team.logo_url && (
                        <img src={game.home_team.logo_url} alt="" className="w-10 h-10 object-contain" />
                      )}
                      {selected_id !== game.away_team.id && game.home_team.name}
                    </button>
                  </div>

                  <button
                    onClick={() => toggleDoubleDown(game.id)}
                    disabled={!selected_id || isLocked}
                    className={clsx(
                      'w-full text-center mt-2 py-2.5 rounded-md text-xs uppercase tracking-wide font-medium transition-all',
                      isLocked
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : isDoubleDown
                        ? 'bg-[#BF1C1F] text-white'
                        : 'bg-zinc-800 text-gray-300'
                    )}
                  >
                    {isDoubleDown ? 'Doubled Down!!' : 'Double Down'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
