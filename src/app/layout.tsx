'use client'

import type { Metadata } from 'next'
import { usePathname } from 'next/navigation'
import { DM_Sans } from 'next/font/google'
import './globals.css'

import Navbar from '@/components/Navbar'

const dmSans = DM_Sans({
  variable: '--font-primary',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'College Pick\'em',
  description: 'Make your college football picks and track the leaderboard.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const hideNavbar =
    pathname.startsWith('/login') ||
    pathname.startsWith('/check-email') ||
    pathname.startsWith('/setup-username') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')

  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased bg-[#0E0E10] text-white`}
      >
        {!hideNavbar && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  )
}
