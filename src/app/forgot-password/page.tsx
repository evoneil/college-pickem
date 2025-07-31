// app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage('Something went wrong. Please try again.')
    } else {
      setMessage('Check your email for a reset link.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-black p-6 rounded-lg shadow text-white">
        <h1 className="text-2xl mb-4 font-bold">Reset Password</h1>
        <input
          type="email"
          className="w-full p-2 mb-4 rounded bg-zinc-800 border border-zinc-600"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded"
          onClick={handleReset}
        >
          Send Reset Link
        </button>
        {message && <p className="mt-4 text-sm text-zinc-300">{message}</p>}
      </div>
    </div>
  )
}
