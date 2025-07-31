'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AuthGate from '@/components/AuthGate'
import { getCurrentWeek } from '@/lib/getCurrentWeek'
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

export default function PicksPage() {
  return (
    <AuthGate>
      <CurrentWeekPicks />
    </AuthGate>
  )
}

function CurrentWeekPicks() {
  const router = useRouter()
  const [currentWeekId, setCurrentWeekId] = useState<number | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [draftPicks, setDraftPicks] = useState<PickDraft[]>([])
  const [originalPicks, setOriginalPicks] = useState<PickDraft[]>([])
  const [showToast, setShowToast] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [weekLocked, setWeekLocked] = useState(false)

  const picksUnchanged = JSON.stringify(draftPicks) === JSON.stringify(originalPicks)

  const doubleDownLocked = draftPicks.some((pick) => {
    const game = games.find((g) => g.id === pick.game_id)
    return pick.double_down && game && new Date(game.lock_time) <= new Date()
  })

  useEffect(() => {
    const init = async () => {
      const id = await getCurrentWeek()
      setCurrentWeekId(id)

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id ?? null
      setUserId(uid)
      if (!uid) return

      const { data: weekData, error: weekError } = await supabase
        .from('weeks')
        .select('*')
        .eq('id', id)
        .single()

      if (weekError || !weekData) return

      const now = new Date()
      const start = new Date(weekData.start_date)
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
        .eq('week', id)

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
          double_down: p.double_down,
        }))
        setDraftPicks(formatted)
        setOriginalPicks(formatted)
      }
    }

    init()
  }, [])

  const updatePick = (game_id: string, selected_team_id: string) => {
    setDraftPicks((prev) => {
      const existing = prev.find((p) => p.game_id === game_id)
      if (existing) {
        return prev.map((p) =>
          p.game_id === game_id ? { ...p, selected_team_id, double_down: false } : p
        )
      } else {
        return [...prev, { game_id, selected_team_id, double_down: false }]
      }
    })
  }

  const toggleDoubleDown = (gameId: string) => {
    const now = new Date()

    const selectedGame = games.find((g) => g.id === gameId)
    if (!selectedGame) return

    const isSelectedGameLocked = new Date(selectedGame.lock_time) <= now

    const lockedDoubleDown = draftPicks.find((p) => {
      const game = games.find((g) => g.id === p.game_id)
      return p.double_down && game && new Date(game.lock_time) <= now
    })

    if (lockedDoubleDown && lockedDoubleDown.game_id !== gameId) return
    if (lockedDoubleDown && lockedDoubleDown.game_id === gameId && isSelectedGameLocked) return

    setDraftPicks((prev) =>
      prev.map((p) =>
        p.game_id === gameId
          ? { ...p, double_down: !p.double_down }
          : { ...p, double_down: false }
      )
    )
  }

  const savePicks = async () => {
    if (!userId || weekLocked) return

    const { error } = await supabase.from('picks').upsert(
      draftPicks.map((pick) => ({
        user_id: userId,
        game_id: pick.game_id,
        selected_team_id: pick.selected_team_id,
        double_down: pick.double_down,
        submitted_at: new Date().toISOString(),
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

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6">
      {showToast && (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl border-1 border-[#7AFFB3] bg-[#14121C] text-white text-lg shadow-md transition-opacity">
          <img
            src="https://ynlmvzuedasovzaesjeq.supabase.co/storage/v1/object/public/graphics/icons-pickssaved.svg"
            alt="Picks Saved"
            className="w-6 h-6"
          />
          <span>Picks Saved</span>
        </div>
      )}

      {!userId ? (
        <div className="text-center text-red-500 font-semibold">
          You must be signed in to make picks.
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-30 bg-black py-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <h1 className="text-xl font-bold">WEEK {currentWeekId} PICKS</h1>
              <button
                onClick={savePicks}
                disabled={picksUnchanged}
                className={clsx(
                  'w-full md:w-auto px-6 py-3 rounded-lg transition-colors border text-s',
                  picksUnchanged
                    ? 'bg-[#2C2A33] text-zinc-400 border-[#3f3f46] cursor-not-allowed'
                    : 'bg-[#212048] border-[#9996FF] text-white hover:bg-[#8574e0] active:bg-[#2E2C67]'
                )}
              >
                Save Picks
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {games.map((game) => {
              const pick = draftPicks.find((p) => p.game_id === game.id)
              const selected_id = pick?.selected_team_id
              const isDoubleDown = pick?.double_down
              const isLocked = new Date() > new Date(game.lock_time)

              const date = new Date(game.kickoff_time)
              const dateStr = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
              const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

              return (
                <div key={game.id} className="bg-zinc-900 border border-[#3f3f46] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>
                      {game.away_team.name} @ {game.home_team.name}
                    </span>
                    <span>{game.difficulty} PTS</span>
                  </div>
                  <div className="text-s pb-2 text-gray-500">
                    {dateStr}, {timeStr} {isLocked && '🔒'}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updatePick(game.id, game.away_team.id)}
                      disabled={isLocked}
                      className={clsx(
                        'relative flex items-center justify-center gap-2 rounded-md py-2 font-semibold text-white transition-all bg-[#24232B] overflow-hidden',
                        selected_id === game.away_team.id
                          ? 'flex-[2]'
                          : selected_id === game.home_team.id
                            ? 'flex-[1]'
                            : 'flex-1',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{
                        background:
                          selected_id === game.away_team.id
                            ? `radial-gradient(circle at center, ${game.away_team.color} 0%, transparent 100%)`
                            : undefined,
                        border: `1px solid ${selected_id === game.away_team.id
                          ? game.away_team.color
                          : '#504E57'
                          }`,
                      }}
                    >
                      {selected_id === game.away_team.id && (
                        <div
                          className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                          style={{ background: 'linear-gradient(to top, #24232B, transparent)' }}
                        />
                      )}
                      {game.away_team.logo_url && (
                        <img
                          src={game.away_team.logo_url}
                          alt=""
                          className="w-10 h-10 object-contain z-10"
                        />
                      )}
                      {selected_id !== game.home_team.id && (
                        <span className="z-10">{game.away_team.short_name}</span>
                      )}
                    </button>

                    <button
                      onClick={() => updatePick(game.id, game.home_team.id)}
                      disabled={isLocked}
                      className={clsx(
                        'relative flex items-center justify-center gap-2 rounded-md py-2 font-semibold text-white transition-all bg-[#24232B] overflow-hidden',
                        selected_id === game.home_team.id
                          ? 'flex-[2]'
                          : selected_id === game.away_team.id
                            ? 'flex-[1]'
                            : 'flex-1',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{
                        background:
                          selected_id === game.home_team.id
                            ? `radial-gradient(circle at center, ${game.home_team.color} 0%, transparent 100%)`
                            : undefined,
                        border: `1px solid ${selected_id === game.home_team.id
                          ? game.home_team.color
                          : '#504E57'
                          }`,
                      }}
                    >
                      {selected_id === game.home_team.id && (
                        <div
                          className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                          style={{ background: 'linear-gradient(to top, #24232B, transparent)' }}
                        />
                      )}
                      {game.home_team.logo_url && (
                        <img
                          src={game.home_team.logo_url}
                          alt=""
                          className="w-10 h-10 object-contain z-10"
                        />
                      )}
                      {selected_id !== game.away_team.id && (
                        <span className="z-10">{game.home_team.short_name}</span>
                      )}
                    </button>
                  </div>

                  {selected_id && (!doubleDownLocked || isDoubleDown) && (
                    <button
                      onClick={() => toggleDoubleDown(game.id)}
                      disabled={isLocked}
                      className={clsx(
                        'w-full text-center mt-2 py-2.5 border border-[#3f3f46] rounded-md text-s uppercase tracking-wide font-medium transition-all flex items-center justify-center gap-2',
                        isLocked
                          ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                          : isDoubleDown
                            ? 'bg-[#43151C] text-white border-[#CE152E]'
                            : 'bg-[#24232B] text-gray-300'
                      )}
                    >
                      <img
                        src="https://ynlmvzuedasovzaesjeq.supabase.co/storage/v1/object/public/graphics//icons-doubledown.svg"
                        alt="Double Down icon"
                        className="w-4 h-4"
                      />
                      {isDoubleDown ? 'Doubled Down!!' : 'Double Down'}
                    </button>
                  )}

                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
