// app/api/overall-leaderboard/route.ts
import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type OutRow = {
  id: string
  username: string
  total: number
  correct: number
  accuracy: number // integer percent
  rank: number
}

function getClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, anon, { auth: { persistSession: false } })
}

export async function GET() {
  let supabase: SupabaseClient
  try {
    supabase = getClient()
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Supabase config error' }, { status: 500 })
  }

  // Fetch profiles with their weekly scores
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      user_weekly_scores (
  total_points,
  correct_picks,
  attempts,
  total_games
)

    `)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate total points, correct picks, attempts, and compute accuracy
  const leaderboard = (profiles ?? []).map((u: any) => {
  const weekly = u.user_weekly_scores ?? []
  const totalPoints = weekly.reduce((sum: number, w: any) => sum + (w.total_points ?? 0), 0)
  const correct = weekly.reduce((sum: number, w: any) => sum + (w.correct_picks ?? 0), 0)
  const totalGames = weekly.reduce((sum: number, w: any) => sum + (w.total_games ?? 0), 0)
  const accuracy = totalGames > 0 ? Math.round((correct / totalGames) * 100) : 0


  return {
    id: u.id,
    username: u.username ?? 'Anonymous',
    total: totalPoints,
    correct,
    accuracy
  }
})


  // Sort by total points, then correct picks
  const sorted = leaderboard.sort((a, b) => (b.total - a.total) || (b.correct - a.correct))

  // Assign ranks, handling ties
  let currentRank = 1
  let lastPlayer: typeof sorted[0] | null = null
  const ranked: OutRow[] = sorted.map((player, index) => {
    if (lastPlayer && player.total === lastPlayer.total && player.correct === lastPlayer.correct) {
      return { ...player, rank: currentRank }
    } else {
      currentRank = index + 1
      lastPlayer = player
      return { ...player, rank: currentRank }
    }
  })

  return NextResponse.json(ranked, { status: 200 })
}
