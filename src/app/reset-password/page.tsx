'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setMessage('Failed to reset password. Try again.')
    } else {
      setMessage('Password updated. Redirecting...')
      setTimeout(() => router.replace('/login'), 2000)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h1 className="text-2xl mb-4 font-bold">Set a New Password</h1>
      <input
        type="password"
        className="w-full p-2 mb-4 rounded bg-zinc-800 border border-zinc-600"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button
        className="w-full bg-green-600 hover:bg-green-500 py-2 rounded"
        onClick={handleUpdate}
      >
        Update Password
      </button>
      {message && <p className="mt-4 text-sm text-zinc-300">{message}</p>}
    </div>
  )
}
