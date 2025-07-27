'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
  difficulty: number
}

type PickDraft = {
  game_id: string
  selected_team_id: string
  double_down: boolean
}

export default function WeekOnePicks() {
  const [games, setGames] = useState<Game[]>([])
  const [draftPicks, setDraftPicks] = useState<PickDraft[]>([])
  const [showToast, setShowToast] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const uid = authData?.user?.id ?? null
      setUserId(uid)
      if (!uid) return

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          id,
          home_team_id,
          away_team_id,
          kickoff_time,
          difficulty,
          home_team:home_team_id (id, name, short_name, logo_url, color),
          away_team:away_team_id (id, name, short_name, logo_url, color)
        `)
        .eq('week_id', 1)

      if (gameError || !gameData) return
      setGames(gameData as any)

      const gameIds = gameData.map((g: any) => g.id)

      const { data: picksData, error: picksError } = await supabase
        .from('picks')
        .select('*')
        .eq('user_id', uid)
        .in('game_id', gameIds)

      if (!picksError && picksData) {
        const formatted = picksData.map((p) => ({
          game_id: p.game_id,
          selected_team_id: p.selected_team_id,
          double_down: p.double_down
        }))
        setDraftPicks(formatted)
      }
    }
    init()
  }, [])

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
    if (!userId) return

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
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } else {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6">
      <h1 className="text-xl font-bold">WEEK 1 PICKS</h1>

      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md z-50 transition-opacity">
          ✅ Picks Saved!
        </div>
      )}

      {!userId ? (
        <div className="text-center text-red-500 font-semibold">You must be signed in to make picks.</div>
      ) : (
        <>
          <button
            onClick={savePicks}
            className="w-full py-2 rounded-lg bg-zinc-800 font-bold text-white mb-4"
          >
            Save Picks
          </button>

          {games.map((game) => {
            const pick = draftPicks.find((p) => p.game_id === game.id)
            const selected_id = pick?.selected_team_id
            const isDoubleDown = pick?.double_down

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
                  {dateStr}, {timeStr}
                </div>

                <div className="flex gap-2 mt-2">
                  {[game.away_team, game.home_team].map((team) => (
                    <button
                      key={team.id}
                      onClick={() => updatePick(game.id, team.id)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 font-semibold text-white border border-zinc-700 transition-all ${selected_id === team.id ? 'ring-2 ring-white' : ''}`}
                      style={{ background: selected_id === team.id ? `radial-gradient(circle at center, ${team.color} 0%, #000000 100%)` : undefined }}
                    >
                      {team.logo_url && (
                        <img src={team.logo_url} alt="" className="w-5 h-5 object-contain" />
                      )}
                      {team.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => toggleDoubleDown(game.id)}
                  disabled={!selected_id}
                  className={`w-full text-center mt-2 py-1.5 rounded-md text-xs uppercase tracking-wide font-medium transition-all ${isDoubleDown ? 'bg-white text-black' : 'bg-zinc-800 text-gray-300'}`}
                >
                  Double Down
                </button>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
