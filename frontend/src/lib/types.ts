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

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string | null
}

export interface Cita {
  id: string
  barbero_id: string
  servicio_id: string
  cliente_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: 'pendiente' | 'completada' | 'cancelada'
  metodo_pago: 'efectivo' | 'debito' | 'transferencia' | null
  monto: number
  notas: string | null
  barbero: Barbero
  servicio: Servicio
  cliente: Cliente
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'dueno' | 'barbero' | 'recepcion'
  barbero_id: string | null
}

export interface LoginResponse {
  access_token: string
  usuario: Usuario
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
