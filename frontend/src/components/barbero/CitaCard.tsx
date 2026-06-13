'use client'

import type { Cita } from '@/lib/types'

interface Props {
  cita: Cita
  onCompletar: (id: string) => void
}

const ESTADO_BADGE: Record<Cita['estado'], string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  completada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-600',
}

const ESTADO_LABEL: Record<Cita['estado'], string> = {
  pendiente: 'Pendiente',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export default function CitaCard({ cita, onCompletar }: Props) {
  const hora = cita.hora_inicio.slice(0, 5)
  const horaFin = cita.hora_fin.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">{hora} – {horaFin}</p>
          <p className="text-sm text-gray-500 mt-0.5">{cita.servicio?.nombre ?? '—'}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_BADGE[cita.estado]}`}>
          {ESTADO_LABEL[cita.estado]}
        </span>
      </div>

      <div className="border-t border-gray-50 pt-3 grid grid-cols-2 gap-1 text-sm text-gray-600">
        <div>
          <span className="text-xs text-gray-400 block">Cliente</span>
          {cita.cliente?.nombre ?? '—'}
        </div>
        <div>
          <span className="text-xs text-gray-400 block">Teléfono</span>
          {cita.cliente?.telefono ?? '—'}
        </div>
        <div className="mt-1">
          <span className="text-xs text-gray-400 block">Servicio</span>
          ${cita.monto?.toLocaleString('es-CL')}
        </div>
        {cita.metodo_pago && (
          <div className="mt-1">
            <span className="text-xs text-gray-400 block">Pago</span>
            {cita.metodo_pago.charAt(0).toUpperCase() + cita.metodo_pago.slice(1)}
          </div>
        )}
      </div>

      {cita.notas && (
        <p className="text-xs text-gray-400 italic border-t border-gray-50 pt-2">{cita.notas}</p>
      )}

      {cita.estado === 'pendiente' && (
        <button
          onClick={() => onCompletar(cita.id)}
          className="mt-1 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition"
        >
          Completar cita
        </button>
      )}
    </div>
  )
}
