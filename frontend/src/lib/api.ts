const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

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

export const api = {
  getBarberos: () => apiFetch<{ id: string; nombre: string }[]>('/public/barberos'),
  getServicios: () => apiFetch<{ id: string; nombre: string; duracion_min: number; precio: number }[]>('/public/servicios'),
  getDisponibilidad: (barberoId: string, fecha: string, servicioId: string) =>
    apiFetch<{ slots: string[]; duracion_min: number }>(
      `/public/disponibilidad?barbero_id=${barberoId}&fecha=${fecha}&servicio_id=${servicioId}`
    ),
  crearCita: (payload: unknown) =>
    apiFetch('/public/citas', { method: 'POST', body: JSON.stringify(payload) }),
}
