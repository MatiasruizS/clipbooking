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

  // Configuración — Barberos (requiere JWT)
  getBarberosAdmin: () => authFetch<import('./types').Barbero[]>('/barberos'),
  createBarbero: (data: { nombre: string; telefono?: string }) =>
    authFetch<import('./types').Barbero>('/barberos', { method: 'POST', body: JSON.stringify(data) }),
  updateBarbero: (id: string, data: { nombre?: string; telefono?: string; activo?: boolean }) =>
    authFetch<import('./types').Barbero>(`/barberos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Configuración — Servicios (requiere JWT)
  getServiciosAdmin: () => authFetch<import('./types').Servicio[]>('/servicios'),
  createServicio: (data: { nombre: string; duracion_min: number; precio: number }) =>
    authFetch<import('./types').Servicio>('/servicios', { method: 'POST', body: JSON.stringify(data) }),
  updateServicio: (id: string, data: { nombre?: string; duracion_min?: number; precio?: number; activo?: boolean }) =>
    authFetch<import('./types').Servicio>(`/servicios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Configuración — Usuarios (solo dueno)
  getUsuarios: () => authFetch<(import('./types').Usuario & { activo: boolean })[]>('/usuarios'),
  createUsuario: (data: { nombre: string; email: string; password: string; rol: string; barbero_id?: string }) =>
    authFetch('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  updateUsuario: (id: string, data: { nombre?: string; email?: string; password?: string; rol?: string; activo?: boolean; barbero_id?: string | null }) =>
    authFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}
