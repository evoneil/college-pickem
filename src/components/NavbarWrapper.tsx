'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function NavbarClient() {
  const pathname = usePathname()
  const hideNavbar =
    pathname.startsWith('/login') ||
    pathname.startsWith('/check-email') ||
    pathname.startsWith('/setup-username')

  if (hideNavbar) return null
  return <Navbar />
}
