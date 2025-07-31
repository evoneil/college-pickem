'use client'

import type { Metadata } from 'next'
import { usePathname } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import { DM_Sans } from 'next/font/google' // swapped in here
import './globals.css'

import Navbar from '@/components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const dmSans = DM_Sans({
  variable: '--font-primary', // overrides --font-primary
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

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
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} antialiased bg-[#0E0E10] text-white`}
      >
        {!hideNavbar && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  )
}
