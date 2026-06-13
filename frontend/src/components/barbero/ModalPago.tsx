'use client'

import { useState } from 'react'

type MetodoPago = 'efectivo' | 'debito' | 'transferencia'

interface Props {
  citaId: string
  onConfirmar: (id: string, metodo: MetodoPago, notas: string) => Promise<void>
  onCerrar: () => void
}

const METODOS: { value: MetodoPago; label: string; icon: string }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'debito', label: 'Débito', icon: '💳' },
  { value: 'transferencia', label: 'Transferencia', icon: '📲' },
]

export default function ModalPago({ citaId, onConfirmar, onCerrar }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago | null>(null)
  const [notas, setNotas] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmar() {
    if (!metodo) return
    setError(null)
    setCargando(true)
    try {
      await onConfirmar(citaId, metodo, notas)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al completar')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl">
        <h2 className="text-base font-bold text-gray-900 mb-1">Completar cita</h2>
        <p className="text-sm text-gray-500 mb-4">Selecciona el método de pago</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {METODOS.map(m => (
            <button
              key={m.value}
              onClick={() => setMetodo(m.value)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-3 text-sm font-medium transition ${
                metodo === m.value
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-zinc-400'
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Notas opcionales…"
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-zinc-600 focus:outline-none resize-none mb-3"
        />

        {error && (
          <p className="text-sm text-red-500 mb-2">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCerrar}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!metodo || cargando}
            className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition disabled:opacity-40"
          >
            {cargando ? 'Guardando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
