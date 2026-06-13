export interface Barbero {
  id: string
  nombre: string
  telefono: string | null
  activo: boolean
}

export interface Servicio {
  id: string
  nombre: string
  duracion_min: number
  precio: number
  activo: boolean
}

export interface DisponibilidadResponse {
  slots: string[]
  duracion_min: number
}

export interface CrearCitaPayload {
  barbero_id: string
  servicio_id: string
  fecha: string
  hora_inicio: string
  nombre_cliente: string
  telefono_cliente: string
  email_cliente?: string
  notas?: string
}

export interface CitaCreada {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  monto: number
  barbero: { nombre: string }
  servicio: { nombre: string }
  cliente: { nombre: string; telefono: string }
}
