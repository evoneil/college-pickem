// app/api/overall-leaderboard/route.ts
import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // keep secrets server-side

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

type Row = {
  id: string
  username: string | null
  total: number
  correct: number
  accuracy: number
}

function resolveGame(g: PickWithGame['games']): GameRow | null {
  if (!g) return null
  return Array.isArray(g) ? (g[0] ?? null) : g
}

// Lazy-init admin client at request time to avoid build-time crashes
function getAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    // Don't throw at module load — throw a clear runtime error
    throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function GET() {
  let supabase: SupabaseClient
  try {
    supabase = getAdmin()
  } catch (e: any) {
    // Return 500 with helpful message instead of crashing build
    return NextResponse.json({ error: e?.message ?? 'Supabase config error' }, { status: 500 })
  }

  // users
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('id, username')
  if (profilesErr) {
    return NextResponse.json({ error: profilesErr.message }, { status: 500 })
  }

  // picks + games
  const { data: picksData, error: picksErr } = await supabase
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
  if (picksErr) {
    return NextResponse.json({ error: picksErr.message }, { status: 500 })
  }

  const picks: PickWithGame[] = (picksData ?? []) as any

  const scorePick = (p: PickWithGame): { pts: number; isCorrect: boolean } => {
    const g = resolveGame(p.games)
    if (!g) return { pts: 0, isCorrect: false }
    if (g.cancelled) return { pts: 0, isCorrect: false }
    const difficulty = Number(g.difficulty ?? 0) || 0
    const isCorrect = !!g.winner_id && p.selected_team_id === g.winner_id
    if (isCorrect) return { pts: p.double_down ? difficulty * 2 : difficulty, isCorrect }
    return { pts: p.double_down ? -difficulty : 0, isCorrect }
  }

  const map: Record<string, Row> = {}
  for (const prof of profiles ?? []) {
    map[prof.id] = {
      id: prof.id,
      username: prof.username ?? 'Anonymous',
      total: 0,
      correct: 0,
      accuracy: 0,
    }
  }

  for (const p of picks) {
    if (!map[p.user_id]) continue
    const { pts, isCorrect } = scorePick(p)
    map[p.user_id].total += pts
    if (isCorrect) map[p.user_id].correct += 1
  }

  // accuracy denominator: only games with a winner and not cancelled
  const scoredByUser: Record<string, number> = {}
  for (const p of picks) {
    const g = resolveGame(p.games)
    if (!g || g.cancelled || !g.winner_id) continue
    scoredByUser[p.user_id] = (scoredByUser[p.user_id] ?? 0) + 1
  }

  for (const u of Object.values(map)) {
    const denom = scoredByUser[u.id] ?? 0
    u.accuracy = denom > 0 ? u.correct / denom : 0
  }

  const rows = Object.values(map).sort((a, b) => b.total - a.total)
  return NextResponse.json({ users: rows }, { status: 200 })
}
