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
  selected_team_id?: string
  double_down?: boolean
}

export default function WeekOnePicks() {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
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

      if (!error && data) setGames(data as any)
    }
    fetchGames()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6">
      <h1 className="text-xl font-bold">WEEK 1 PICKS</h1>

      {games.map((game) => {
        const date = new Date(game.kickoff_time)
        const dateStr = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
        const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

        return (
          <div key={game.id} className="bg-zinc-900 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                {game.home_team.name} @ {game.away_team.name}
              </span>
              <span>{game.difficulty} PTS</span>
            </div>
            <div className="text-xs text-gray-500">
              {dateStr}, {timeStr}
            </div>

            <div className="flex gap-2 mt-2">
              {[game.home_team, game.away_team].map((team) => (
                <button
                  key={team.id}
                  className="flex-1 flex items-center justify-center gap-2 rounded-md py-2 font-semibold text-white border border-zinc-700"
                  style={{ background: game.selected_team_id === team.id ? `radial-gradient(circle at center, ${team.color} 0%, #000000 100%)` : undefined }}
                >
                  {team.logo_url && (
                    <img src={team.logo_url} alt="" className="w-10 h-10 object-contain" />
                  )}
                  {team.name}
                </button>
              ))}
            </div>

            <button className="w-full text-center mt-2 py-1.5 rounded-md bg-zinc-800 text-xs uppercase tracking-wide font-medium">
              Double Down
            </button>
          </div>
        )
      })}
    </div>
  )
}
