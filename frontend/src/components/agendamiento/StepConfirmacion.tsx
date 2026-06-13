'use client'

import type { Barbero, Servicio } from '@/lib/types'

interface Props {
  cita: {
    servicio: Servicio
    barbero: Barbero
    fecha: string
    hora: string
    nombre: string
    telefono: string
  }
  onNueva: () => void
}

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatearFecha(fechaStr: string): string {
  const [y, m, d] = fechaStr.split('-').map(Number)
  return `${d} de ${MESES[m - 1]} de ${y}`
}

export default function StepConfirmacion({ cita, onNueva }: Props) {
  return (
    <div className="text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl mb-4">
        ✓
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">¡Reserva confirmada!</h2>
      <p className="text-sm text-gray-500 mb-8">
        Te esperamos, {cita.nombre.split(' ')[0]}.
      </p>

      <div className="rounded-xl border border-gray-200 bg-gray-50 text-left divide-y divide-gray-200 mb-8">
        <Row label="Servicio" value={cita.servicio.nombre} />
        <Row label="Barbero" value={cita.barbero.nombre} />
        <Row label="Fecha" value={formatearFecha(cita.fecha)} />
        <Row label="Hora" value={cita.hora} />
        <Row label="Precio" value={`$${Number(cita.servicio.precio).toLocaleString('es-CL')}`} />
      </div>

      <button
        onClick={onNueva}
        className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition focus:outline-none"
      >
        Reservar otra cita
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
