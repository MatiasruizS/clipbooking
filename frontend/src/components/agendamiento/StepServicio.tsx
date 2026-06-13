'use client'

import type { Servicio } from '@/lib/types'

interface Props {
  servicios: Servicio[]
  seleccionado: string | null
  onSelect: (id: string) => void
}

export default function StepServicio({ servicios, seleccionado, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">¿Qué servicio necesitas?</h2>
      <p className="text-sm text-gray-500 mb-6">Selecciona el servicio que deseas reservar.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {servicios.map((s) => {
          const activo = seleccionado === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex flex-col items-start text-left rounded-xl border-2 px-5 py-4 transition-all focus:outline-none
                ${activo
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-zinc-400'
                }`}
            >
              <span className="font-semibold text-base">{s.nombre}</span>
              <div className="mt-2 flex gap-3 text-sm">
                <span className={activo ? 'text-zinc-300' : 'text-gray-500'}>
                  {s.duracion_min} min
                </span>
                <span className={`font-medium ${activo ? 'text-white' : 'text-zinc-800'}`}>
                  ${Number(s.precio).toLocaleString('es-CL')}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
