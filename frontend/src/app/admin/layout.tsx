'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { usuario, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!usuario) { router.replace('/login'); return }
    if (usuario.rol === 'barbero') { router.replace('/barbero') }
  }, [usuario, loading, router])

  if (loading || !usuario || usuario.rol === 'barbero') return null

  const nav = [
    { href: '/admin', label: 'Agenda' },
    { href: '/admin/caja', label: 'Caja' },
    ...(usuario.rol === 'dueno' ? [{ href: '/admin/configuracion', label: 'Configuración' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">✂️ ClipBooking</span>
          <nav className="flex gap-1">
            {nav.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  pathname === n.href
                    ? 'bg-zinc-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">{usuario.nombre}</span>
          <button
            onClick={() => { logout(); router.push('/login') }}
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
