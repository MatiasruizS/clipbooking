import type { Cita, LoginResponse } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('cb_token')
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  return apiFetch<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init?.headers },
  })
}

export const api = {
  // Público
  getBarberos: () => apiFetch<{ id: string; nombre: string }[]>('/public/barberos'),
  getServicios: () => apiFetch<{ id: string; nombre: string; duracion_min: number; precio: number }[]>('/public/servicios'),
  getDisponibilidad: (barberoId: string, fecha: string, servicioId: string) =>
    apiFetch<{ slots: string[]; duracion_min: number }>(
      `/public/disponibilidad?barbero_id=${barberoId}&fecha=${fecha}&servicio_id=${servicioId}`
    ),
  crearCita: (payload: unknown) =>
    apiFetch('/public/citas', { method: 'POST', body: JSON.stringify(payload) }),

  // Auth
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Citas (requiere JWT)
  getCitasHoy: () => authFetch<Cita[]>('/citas/hoy'),
  getCitas: () => authFetch<Cita[]>('/citas'),
  completarCita: (id: string, metodo_pago: string, notas?: string) =>
    authFetch<Cita>(`/citas/${id}/completar`, {
      method: 'PUT',
      body: JSON.stringify({ metodo_pago, notas }),
    }),
  cancelarCita: (id: string) =>
    authFetch<Cita>(`/citas/${id}/cancelar`, { method: 'PUT' }),

  // Caja (requiere JWT)
  getCuadratura: (fecha?: string) => {
    const params = fecha ? `?fecha=${fecha}` : ''
    return authFetch(`/caja/cuadratura${params}`)
  },
}
