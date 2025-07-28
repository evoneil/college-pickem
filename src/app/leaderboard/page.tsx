'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Game = {
  id: string
  week: number
  difficulty: number
  winner_id: string
}

type Pick = {
  game_id: string
  selected_team_id: string
  double_down: boolean
}

const USER_ID = 'dde997f5-9774-4bac-b3f9-98a8fb84e92c'


export default function Week1Score() {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    const fetchWeek1Score = async () => {
      // 1. Get all week 1 games
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id, week, difficulty, winner_id')
        .eq('week', 1)

        console.log('GAMES', games)
        console.log('GAMES ERROR', gamesError)
        if (gamesError || !games || games.length === 0) {
        console.warn('No games found or error occurred')
        return
        }

        console.log('Fetched game IDs:', games.map(g => g.id))

      const gameIds = games.map((g) => g.id)

      // 2. Get picks for that user & week
      const { data: picks, error: picksError } = await supabase
        .from('picks')
        .select('game_id, selected_team_id, double_down')
        .eq('user_id', USER_ID)
        .in('game_id', gameIds)

      if (picksError || !picks) {
        console.error(picksError)
        return
      }

      // 3. Calculate score
      let total = 0

      for (const pick of picks) {
        const game = games.find((g) => g.id === pick.game_id)
        if (!game) continue

        const correct = pick.selected_team_id === game.winner_id
        const base = game.difficulty

        if (correct) {
          total += pick.double_down ? base * 2 : base
        } else {
          total += pick.double_down ? -base : 0
        }
      }

      setScore(total)
    }

    fetchWeek1Score()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Week 1 Score</h1>
      {score !== null ? (
        <p className="text-2xl mt-2">{score} points</p>
      ) : (
        <p>Loading score...</p>
      )}
    </div>
  )
}
