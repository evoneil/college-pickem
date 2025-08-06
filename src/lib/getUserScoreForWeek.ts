import { supabase } from '@/lib/supabaseClient'

export async function getUserScoreForWeek(userId: string, week: number): Promise<number> {
  // 1. Get all games from that week, including `cancelled`
  const { data: games } = await supabase
    .from('games')
    .select('id, difficulty, winner_id, cancelled')
    .eq('week', week)

  if (!games) return 0

  // Filter out cancelled games
  const validGames = games.filter(g => !g.cancelled)
  const gameIds = validGames.map(g => g.id)

  // 2. Get that user's picks for those valid games
  const { data: picks } = await supabase
    .from('picks')
    .select('game_id, selected_team_id, double_down')
    .eq('user_id', userId)
    .in('game_id', gameIds)

  if (!picks) return 0

  // 3. Calculate the score
  let score = 0
  for (const pick of picks) {
    const game = validGames.find(g => g.id === pick.game_id)
    if (!game || game.winner_id === null) continue // 🛠️ Skip unplayed games

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
