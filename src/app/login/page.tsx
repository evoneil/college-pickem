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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        await checkUsernameAndRedirect()
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: 'fake-test-password',
      })
      if (loginError && loginError.message === 'Invalid login credentials') {
        setError('This email is already registered. Try logging in instead.')
        return
      }

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

    const { data: profile } = await supabase
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E13] px-4 text-white">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">LOGO</h1>
        <p className="text-sm text-gray-400 mt-2">A tagline for my app</p>
      </div>

      <div className="w-full max-w-sm bg-[#1B1A22] p-6 rounded-xl border border-[#2D2C36] shadow">
        <h2 className="text-xl font-semibold mb-5">{isLogin ? 'Log In' : 'Sign Up'}</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 rounded-md bg-[#2A2933] text-sm text-white placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#5C5BF0]"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-2 px-4 py-2 rounded-md bg-[#2A2933] text-sm text-white placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#5C5BF0]"
          onChange={(e) => setPassword(e.target.value)}
        />

        {isLogin && (
          <div className="text-right mb-3">
            <button
              className="text-xs text-[#9CA3AF] hover:text-white transition"
              onClick={() => router.push('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleAuth}
          className="w-full bg-[#5C5BF0] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#7675ff] transition"
        >
          {isLogin ? 'Login In' : 'Create Account'}
        </button>

        <div className="flex items-center my-5">
          <div className="flex-grow h-px bg-[#2D2C36]" />
          <span className="px-3 text-xs text-gray-500">
            {isLogin ? 'New to APP?' : 'Already have an account?'}
          </span>
          <div className="flex-grow h-px bg-[#2D2C36]" />
        </div>

        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setError(null)
          }}
          className="w-full border border-[#2D2C36] text-sm text-white py-2 rounded-md hover:bg-[#2A2933] transition"
        >
          {isLogin ? 'Create an Account' : 'Log In'}
        </button>
      </div>
    </div>
  )
}
