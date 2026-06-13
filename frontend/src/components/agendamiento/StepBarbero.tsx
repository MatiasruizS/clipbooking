'use client'

import type { Barbero } from '@/lib/types'

interface Props {
  barberos: Barbero[]
  seleccionado: string | null
  onSelect: (id: string) => void
}

export default function StepBarbero({ barberos, seleccionado, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">¿Con quién quieres tu cita?</h2>
      <p className="text-sm text-gray-500 mb-6">Elige tu barbero de confianza.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {barberos.map((b) => {
          const activo = seleccionado === b.id
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 transition-all focus:outline-none
                ${activo
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-zinc-400'
                }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold
                ${activo ? 'bg-white text-zinc-900' : 'bg-zinc-100 text-zinc-700'}`}>
                {b.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold">{b.nombre}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
