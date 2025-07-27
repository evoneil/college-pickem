'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
  setError(null)

  if (isLogin) {
    // LOGIN
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      await checkUsernameAndRedirect()
    }
  } else {
    // SIGNUP
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      // 🔒 Do NOT try to check username here — user isn't confirmed yet
      router.push('/check-email')
    }
  }
}


  const checkUsernameAndRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (profile?.username) {
      router.push('/week/current') // or your main page
    } else {
      router.push('/setup-username')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-black p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isLogin ? 'Log In' : 'Sign Up'}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>

        <p className="text-sm text-center mt-4">
          {isLogin ? 'New here?' : 'Already have an account?'}{' '}
          <button
            className="text-blue-600 underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}
