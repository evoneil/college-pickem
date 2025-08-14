import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
  if (!profiles) return NextResponse.json([])

  // Fetch valid games
  const { data: games } = await supabase
    .from('games')
    .select('id, winner_id, cancelled, difficulty')
  const validGames = (games || []).filter(g => !g.cancelled && g.winner_id !== null)
  const totalValidGames = validGames.length

  // Fetch all picks
  const { data: picks } = await supabase
    .from('picks')
    .select('user_id, game_id, selected_team_id, double_down')

  // Build leaderboard
  const rows = profiles.map(user => {
    const userPicks = picks?.filter(p => p.user_id === user.id) || []

    let total = 0
    let correctCount = 0
    for (const pick of userPicks) {
      const game = validGames.find(g => g.id === pick.game_id)
      if (!game) continue
      const correct = pick.selected_team_id === game.winner_id
      if (correct) {
        correctCount++
        total += pick.double_down ? game.difficulty * 2 : game.difficulty
      } else if (pick.double_down) {
        total -= game.difficulty
      }
    }

    const accuracy = totalValidGames > 0
      ? Math.round((correctCount / totalValidGames) * 100)
      : 0

    return { ...user, total, correct: correctCount, accuracy }
  })

  // Sort & rank
  const sorted = rows.sort((a, b) => (b.total - a.total) || (b.correct - a.correct))
  let currentRank = 1
  let lastPlayer = null as typeof sorted[0] | null
  const ranked = sorted.map((p, i) => {
    if (lastPlayer && p.total === lastPlayer.total && p.correct === lastPlayer.correct) {
      return { ...p, rank: currentRank }
    } else {
      currentRank = i + 1
      lastPlayer = p
      return { ...p, rank: currentRank }
    }
  })

  return NextResponse.json(ranked)
}
