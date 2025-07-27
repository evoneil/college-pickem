'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentWeek } from '@/lib/getCurrentWeek'
import { getUsername } from '@/lib/getUsername'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentWeek, setCurrentWeek] = useState<number | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  // Get current week and username
  useEffect(() => {
    getCurrentWeek().then(setCurrentWeek)
    getUsername().then(setUsername)

    // Listen for login/logout changes
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
  }

  return (
    <nav className="bg-[#18171C] text-white px-4 py-3 flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image src="/logo.svg" alt="Logo" width={24} height={24} />
        <span className="font-extrabold italic text-xl">LOGO</span>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex space-x-8 text-sm">
        {currentWeek && (
          <Link href={`/week/${currentWeek}`} className="hover:underline">
            Make Your Picks
          </Link>
        )}
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
      </div>

      {/* Right side: Username/Login + Hamburger */}
<div className="flex items-center space-x-4 text-sm">
  {username ? (
    <div className="hidden md:flex items-center space-x-3">
      <span>{username}</span>
      <button
        onClick={handleLogout}
        className="underline text-red-400 hover:text-red-300"
      >
        Logout
      </button>
    </div>
  ) : (
    <Link href="/login">Login</Link>
  )}

  {/* Hamburger toggle for mobile */}
  <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
    {isOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
</div>


      {/* Full-screen mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#18171C] text-white md:hidden flex flex-col items-center justify-center space-y-6 text-xl">
          {currentWeek && (
            <Link href={`/week/${currentWeek}`} onClick={() => setIsOpen(false)} className="hover:underline">
              Make Your Picks
            </Link>
          )}
          <Link href="/leaderboard" onClick={() => setIsOpen(false)} className="hover:underline">
            Leaderboard
          </Link>
          {username && (
            <>
              <span className="pt-2 text-lg">{username}</span>
              <button onClick={handleLogout} className="underline text-red-400 hover:text-red-300">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
