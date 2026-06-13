'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Usuario } from '@/lib/types'

interface AuthState {
  usuario: Usuario | null
  token: string | null
  loading: boolean
  login: (token: string, usuario: Usuario) => void
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  usuario: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('cb_token')
    const u = localStorage.getItem('cb_usuario')
    if (t && u) {
      setToken(t)
      setUsuario(JSON.parse(u))
    }
    setLoading(false)
  }, [])

  function login(token: string, usuario: Usuario) {
    localStorage.setItem('cb_token', token)
    localStorage.setItem('cb_usuario', JSON.stringify(usuario))
    setToken(token)
    setUsuario(usuario)
  }

  function logout() {
    localStorage.removeItem('cb_token')
    localStorage.removeItem('cb_usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
