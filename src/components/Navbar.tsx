'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentWeek } from '@/lib/getCurrentWeek'
import { getUsername } from '@/lib/getUsername'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentWeek, setCurrentWeek] = useState<number | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    getCurrentWeek().then(setCurrentWeek)
    getUsername().then(setUsername)
  }, [])

  return (
    <nav className="bg-[#18171C] text-white px-4 py-3 flex items-center justify-between relative">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image src="/logo.svg" alt="Logo" width={24} height={24} />
        <span className="font-extrabold italic text-xl">LOGO</span>
      </div>

      {/* Desktop Links */}
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

      {/* Right Side: Username or Login + Mobile Menu Toggle */}
      <div className="flex items-center space-x-4">
        <span className="text-sm">
          {username ? username : <Link href="/login">Login</Link>}
        </span>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#18171C] text-white md:hidden flex flex-col items-start px-4 py-3 space-y-2 z-50">
          {currentWeek && (
            <Link href={`/week/${currentWeek}`} className="hover:underline w-full">
              Make Your Picks
            </Link>
          )}
          <Link href="/leaderboard" className="hover:underline w-full">
            Leaderboard
          </Link>
        </div>
      )}
    </nav>
  )
}
