'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentWeek } from '@/lib/getCurrentWeek'
import { getUsername } from '@/lib/getUsername'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    getUsername().then(setUsername)

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        getUsername().then(setUsername)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUsername(null)
    setIsOpen(false)
    router.replace('/login')
  }

  return (
    <nav className="bg-[#18171C] text-white px-4 py-3 ">
      <div className="flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="https://ynlmvzuedasovzaesjeq.supabase.co/storage/v1/object/public/graphics//theo-logo.svg" alt="THEO Logo" className="h-8"/>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex space-x-8 text-sm">
        <Link href="/picks" className="hover:underline">
          Make Your Picks
        </Link>
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
        <Link href="/rules" className="hover:underline">
          Rules
        </Link>
      </div>

      {/* Right side: Username + Logout + Hamburger */}
      <div className="flex items-center space-x-4 text-sm">
        {username ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Image
                src="https://ynlmvzuedasovzaesjeq.supabase.co/storage/v1/object/public/graphics//user.svg"
                alt="Profile Icon"
                width={20}
                height={20}
                className="rounded-full"
              />
              <span>{username}</span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden md:inline underline text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login">Login</Link>
        )}

        {/* Hamburger (mobile only) */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#18171C] text-white md:hidden flex flex-col items-center justify-center space-y-6 text-xl">
          <Link href="/picks" onClick={() => setIsOpen(false)} className="hover:underline">
            Make Your Picks
          </Link>
          <Link href="/leaderboard" onClick={() => setIsOpen(false)} className="hover:underline">
            Leaderboard
          </Link>
          <Link href="/rules" onClick={() => setIsOpen(false)} className="hover:underline">
            Rules
          </Link>
          {username && (
            <button onClick={handleLogout} className="underline text-red-400 hover:text-red-300">
              Logout
            </button>
          )}
        </div>
      )}
      </div>
    </nav>
  )
}