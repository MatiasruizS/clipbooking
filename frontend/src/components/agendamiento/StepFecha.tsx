'use client'

import { useState } from 'react'

interface Props {
  seleccionada: string | null
  onSelect: (fecha: string) => void
}

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function StepFecha({ seleccionada, onSelect }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [mes, setMes] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const primerDiaMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
  // Ajustar para que la semana empiece en lunes (0=Lu)
  let startOffset = primerDiaMes.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()

  const celdas: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1)),
  ]

  const mesAnterior = () => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))
  const mesSiguiente = () => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))

  const esPasado = (d: Date) => d < today
  const esHoy = (d: Date) => toLocalDateString(d) === toLocalDateString(today)

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">¿Qué día te acomoda?</h2>
      <p className="text-sm text-gray-500 mb-6">Selecciona una fecha disponible.</p>

      <div className="rounded-xl border border-gray-200 bg-white p-4 max-w-sm mx-auto">
        {/* Cabecera mes */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={mesAnterior}
            disabled={mes <= new Date(today.getFullYear(), today.getMonth(), 1)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-800 text-sm">
            {MESES[mes.getMonth()]} {mes.getFullYear()}
          </span>
          <button onClick={mesSiguiente} className="p-1 rounded hover:bg-gray-100">›</button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 mb-1">
          {DIAS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7 gap-y-1">
          {celdas.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />
            const fechaStr = toLocalDateString(d)
            const pasado = esPasado(d)
            const selec = fechaStr === seleccionada
            const hoy = esHoy(d)

            return (
              <button
                key={fechaStr}
                disabled={pasado}
                onClick={() => onSelect(fechaStr)}
                className={`aspect-square w-full flex items-center justify-center rounded-lg text-sm transition-all focus:outline-none
                  ${pasado ? 'text-gray-300 cursor-not-allowed' : ''}
                  ${selec ? 'bg-zinc-900 text-white font-semibold' : ''}
                  ${!selec && !pasado ? 'hover:bg-gray-100 text-gray-700' : ''}
                  ${hoy && !selec ? 'font-bold text-zinc-900 underline underline-offset-2' : ''}
                `}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
