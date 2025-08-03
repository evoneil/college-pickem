// trigger rebuild
import './globals.css'
// import { DM_Sans } from 'next/font/google'
import NavbarClient from '@/components/NavbarWrapper'

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   display: 'swap',
//   variable: '--font-primary',
// })

export const metadata = {
  title: 'College Pick’em',
  description: 'Pick weekly college football games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif' }}>
        <NavbarClient />
        {children}
      </body>
    </html >
  )
}
