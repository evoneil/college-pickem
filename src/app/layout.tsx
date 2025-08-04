import './globals.css'
import NavbarClient from '@/components/NavbarWrapper'
import { DM_Sans } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans', // optional: for CSS variables
  weight: ['400', '500', '700'], // include the weights you plan to use
  display: 'swap',
})

export const metadata = {
  title: 'College Pick’em',
  description: 'Pick weekly college football games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.variable}>
        <NavbarClient />
        {children}
      </body>
    </html >
  )
}
