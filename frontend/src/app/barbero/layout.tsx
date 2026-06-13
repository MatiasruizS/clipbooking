'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function BarberoLayout({ children }: { children: React.ReactNode }) {
  const { usuario, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!usuario) {
      router.replace('/login')
      return
    }
    if (usuario.rol !== 'barbero') {
      router.replace('/admin')
    }
  }, [usuario, loading, router])

  if (loading || !usuario || usuario.rol !== 'barbero') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <span className="font-bold text-gray-900">✂️ ClipBooking</span>
          <span className="ml-3 text-sm text-gray-500">{usuario.nombre}</span>
        </div>
        <button
          onClick={() => { logout(); router.push('/login') }}
          className="text-sm text-gray-500 hover:text-gray-800 transition"
        >
          Cerrar sesión
        </button>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
