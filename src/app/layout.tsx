import './globals.css'
import NavbarClient from '@/components/NavbarWrapper'

export const metadata = {
  title: 'College Pick’em',
  description: 'Pick weekly college football games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavbarClient />
        {children}
      </body>
    </html >
  )
}
