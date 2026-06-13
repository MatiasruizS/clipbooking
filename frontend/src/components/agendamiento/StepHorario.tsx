'use client'

interface Props {
  slots: string[]
  cargando: boolean
  seleccionado: string | null
  onSelect: (hora: string) => void
}

export default function StepHorario({ slots, cargando, seleccionado, onSelect }: Props) {
  if (cargando) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Elige tu horario</h2>
        <p className="text-sm text-gray-500 mb-6">Buscando disponibilidad…</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Elige tu horario</h2>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm text-amber-700">
          No hay horarios disponibles para este día.<br />
          <span className="font-medium">Prueba con otra fecha.</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Elige tu horario</h2>
      <p className="text-sm text-gray-500 mb-6">Horarios disponibles para el día seleccionado.</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {slots.map((slot) => {
          const activo = seleccionado === slot
          return (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`rounded-lg border-2 py-2 text-sm font-medium transition-all focus:outline-none
                ${activo
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-zinc-400'
                }`}
            >
              {slot}
            </button>
          )
        })}
      </div>
    </div>
  )
}
