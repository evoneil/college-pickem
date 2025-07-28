'use client'

import type { Metadata } from 'next'
import { usePathname } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import { Titillium_Web } from 'next/font/google'
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

const titillium = Titillium_Web({
  variable: '--font-primary',
  subsets: ['latin'],
  weight: '700',
  style: 'italic',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const hideNavbar = pathname.startsWith('/login') || pathname.startsWith('/signup')

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${titillium.variable} antialiased bg-[#0E0E10] text-white`}
      >
        {!hideNavbar && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  )
}
