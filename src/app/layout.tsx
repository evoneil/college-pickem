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
  title: 'THEO Picks',
  description: 'Pick weekly college football games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Favicon for light mode */}
        <link
          rel="icon"
          href="/favicon-light.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: light)"
        />
        {/* Favicon for dark mode */}
        <link
          rel="icon"
          href="/favicon-dark.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className={dmSans.variable}>
        <NavbarClient />
        {children}
      </body>
    </html >
  )
}
