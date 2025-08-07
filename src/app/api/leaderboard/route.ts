import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekParam = searchParams.get('week')
  const weekId = parseInt(weekParam ?? '', 10)

  if (isNaN(weekId)) {
    return NextResponse.json({ error: 'Invalid week ID' }, { status: 400 })
  }

  // Fetch all games for the week (exclude cancelled)
  const { data: games } = await supabase
    .from('games')
    .select('id, difficulty, winner_id, cancelled')
    .eq('week', weekId)

  if (!games) return NextResponse.json([], { status: 200 })

  const validGames = games.filter((g) => !g.cancelled)
  const gameIds = validGames.map((g) => g.id)

  // Fetch all users
  const { data: users } = await supabase.from('profiles').select('id, username')
  if (!users) return NextResponse.json([], { status: 200 })

  // Fetch all picks for those games
  const { data: allPicks } = await supabase
    .from('picks')
    .select('user_id, game_id, selected_team_id, double_down')
    .in('game_id', gameIds)

  if (!allPicks) return NextResponse.json([], { status: 200 })

  // Process rows
  const leaderboard = users.map((user) => {
    const userPicks = allPicks.filter((p) => p.user_id === user.id)

    let score = 0
    for (const pick of userPicks) {
      const game = validGames.find((g) => g.id === pick.game_id)
      if (!game || !game.winner_id) continue

      const correct = pick.selected_team_id === game.winner_id
      const base = game.difficulty

      if (correct) {
        score += pick.double_down ? base * 2 : base
      } else {
        score += pick.double_down ? -base : 0
      }
    }

    return {
      id: user.id,
      username: user.username,
      picks: userPicks,
      total: score,
    }
  })

  return NextResponse.json(leaderboard)
}
