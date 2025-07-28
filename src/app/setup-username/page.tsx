'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentWeek } from '@/lib/getCurrentWeek'

export default function SetupUsername() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // ✅ Redirect based on session + profile
  useEffect(() => {
    const enforceCorrectFlow = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      if (profile?.username) {
        const currentWeekId = await getCurrentWeek()
        if (currentWeekId) {
          router.replace(`/week/${currentWeekId}`)
        } else {
          router.replace('/login')
        }
      }
    }

    enforceCorrectFlow()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = username.trim()

    if (trimmed.length === 0 || trimmed.length > 30) {
      setError('Username must be between 1 and 30 characters.')
      return
    }

    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (!user || userError) {
      setError('Authentication failed. Please log in again.')
      setLoading(false)
      return
    }

    const result = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: trimmed }, { onConflict: 'id' })

    if (result.error) {
      console.error('Upsert error:', result.error)
      setError(result.error.message || 'Something went wrong.')
    } else {
      const currentWeekId = await getCurrentWeek()
      if (currentWeekId) {
        router.push(`/week/${currentWeekId}`)
      } else {
        router.push('/login')
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a username</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={30}
          placeholder="Enter username"
          className="w-full border rounded p-2"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save Username'}
        </button>
      </form>
    </div>
  )
}
