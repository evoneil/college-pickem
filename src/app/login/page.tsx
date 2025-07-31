'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    setError(null)

    if (isLogin) {
      // 🔐 LOGIN FLOW
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else {
        await checkUsernameAndRedirect()
      }
    } else {
      // ✉️ SIGNUP FLOW WITH REDIRECT TO /setup-username AFTER EMAIL CONFIRMATION
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/post-auth-check`,
        },
      })



      if (error) {
        setError(error.message)
      } else {
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
      router.push('/picks')
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
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        {isLogin && (
          <div className="text-right mb-4">
            <button
              className="text-sm text-blue-500 underline hover:text-blue-400 transition"
              onClick={() => router.push('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
        )}


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
