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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    // cleanup on unmount just in case
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUsername(null)
    setIsOpen(false)
    router.replace('/login')
  }

  return (
    <nav className=" text-white px-4 py-3">
      <div className="flex items-center justify-between relative z-50">

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/picks">
            <img
              src="https://ynlmvzuedasovzaesjeq.supabase.co/storage/v1/object/public/graphics//theo-logo.svg"
              alt="THEO Logo"
              className="h-8 cursor-pointer"
            />
          </Link>
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
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-[#18171C] text-white md:hidden">
            {/* Close button in top-right */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>

            {/* Fullscreen centered menu items */}
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
              <Link
                href="/picks"
                onClick={() => setIsOpen(false)}
                className="hover:underline"
              >
                Make Your Picks
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setIsOpen(false)}
                className="hover:underline"
              >
                Leaderboard
              </Link>
              <Link
                href="/rules"
                onClick={() => setIsOpen(false)}
                className="hover:underline"
              >
                Rules
              </Link>
              {username && (
                <button
                  onClick={handleLogout}
                  className="underline text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  )
}
