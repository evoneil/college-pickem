import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import NavbarWrapper from '@/components/NavbarWrapper'

const dmSans = DM_Sans({
  variable: '--font-primary',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'College Pick\'em',
  description: 'Make your weekly college football picks!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased bg-[#0E0E10] text-white`}>
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  )
}
