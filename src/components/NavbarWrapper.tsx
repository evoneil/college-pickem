'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()
  const hideNavbar =
    pathname.startsWith('/login') ||
    pathname.startsWith('/check-email') ||
    pathname.startsWith('/setup-username') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')

  return !hideNavbar ? <Navbar /> : null
}
