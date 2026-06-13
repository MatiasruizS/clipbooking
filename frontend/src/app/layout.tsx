import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'ClipBooking',
  description: 'Sistema de agendamiento para barberías',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="antialiased"><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
