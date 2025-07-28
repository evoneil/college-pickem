import { supabase } from '@/lib/supabaseClient'

export async function getUserScoreForWeek(userId: string, week: number): Promise<number> {
  // 1. Get all games from that week
  const { data: games } = await supabase
    .from('games')
    .select('id, difficulty, winner_id')
    .eq('week', week)

  if (!games) return 0

  const gameIds = games.map(g => g.id)

  // 2. Get that user's picks for those games
  const { data: picks } = await supabase
    .from('picks')
    .select('game_id, selected_team_id, double_down')
    .eq('user_id', userId)
    .in('game_id', gameIds)

  if (!picks) return 0

  // 3. Calculate the score
  let score = 0
  for (const pick of picks) {
    const game = games.find(g => g.id === pick.game_id)
    if (!game) continue
    const correct = pick.selected_team_id === game.winner_id
    const base = game.difficulty

    if (correct) {
      score += pick.double_down ? base * 2 : base
    } else {
      score += pick.double_down ? -base : 0
    }
  }

  return score
}
