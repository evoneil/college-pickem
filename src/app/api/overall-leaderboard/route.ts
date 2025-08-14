// app/api/overall-leaderboard/route.ts
import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type GameRow = {
  id: string
  winner_id: string | null
  difficulty: number | null
  cancelled: boolean | null
}

type PickWithGame = {
  user_id: string
  game_id: string
  selected_team_id: string
  double_down: boolean
  games: GameRow | GameRow[] | null
}

type OutRow = {
  id: string
  username: string
  total: number
  correct: number
  accuracy: number // integer 0–100
  rank: number
}

// Normalize the joined relation shape (Supabase sometimes returns array)
function resolveGame(g: PickWithGame['games']): GameRow | null {
  if (!g) return null
  return Array.isArray(g) ? (g[0] ?? null) : g
}

// Lazily create client at request time (prevents build-time errors)
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

  // Profiles (seed all users so they appear even with 0 picks)
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, username')
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // Picks + joined game fields we need
  const { data: picksData, error: xErr } = await supabase
    .from('picks')
    .select(`
      user_id,
      game_id,
      selected_team_id,
      double_down,
      games:game_id (
        id,
        winner_id,
        difficulty,
        cancelled
      )
    `)
  if (xErr) return NextResponse.json({ error: xErr.message }, { status: 500 })

  const picks: PickWithGame[] = (picksData ?? []) as any

  // Aggregate per user
  const agg: Record<string, { id: string; username: string; total: number; correct: number; attempts: number }> = {}
  for (const u of profiles ?? []) {
    agg[u.id] = { id: u.id, username: u.username ?? 'Anonymous', total: 0, correct: 0, attempts: 0 }
  }

  for (const p of picks) {
    const bucket = agg[p.user_id]
    if (!bucket) continue
    const g = resolveGame(p.games)
    // Only score finished, non-cancelled games
    if (!g || g.cancelled || !g.winner_id) continue
    const diff = Number(g.difficulty ?? 0) || 0
    const isCorrect = p.selected_team_id === g.winner_id
    bucket.total += isCorrect ? (p.double_down ? diff * 2 : diff) : (p.double_down ? -diff : 0)
    bucket.correct += isCorrect ? 1 : 0
    bucket.attempts += 1
  }

  const rows: OutRow[] = Object.values(agg)
    .map(r => ({
      id: r.id,
      username: r.username,
      total: r.total,
      correct: r.correct,
      accuracy: r.attempts ? Math.round((r.correct / r.attempts) * 100) : 0,
      rank: 0, // fill in after sort
    }))
    .sort((a, b) => b.total - a.total)
    .map((r, i) => ({ ...r, rank: i + 1 }))

  // Return a **plain array** (important)
  return NextResponse.json(rows, { status: 200 })
}
