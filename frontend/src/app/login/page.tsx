'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

export default function LoginPage() {
  const { login, usuario, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!loading && usuario) {
      router.replace(usuario.rol === 'barbero' ? '/barbero' : '/admin')
    }
  }, [usuario, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const res = await api.login(email, password)
      login(res.access_token, res.usuario)
      router.replace(res.usuario.rol === 'barbero' ? '/barbero' : '/admin')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return null

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition'

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">✂️ ClipBooking</h1>
          <p className="mt-1 text-sm text-gray-500">Panel de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputCls}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition disabled:opacity-40"
          >
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
