'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Cuadratura {
  fecha: string
  total: number
  cantidad_citas: number
  por_barbero: { nombre: string; total: number; cantidad: number }[]
  por_metodo_pago: Record<string, number>
}

const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  transferencia: 'Transferencia',
}

export default function CajaPage() {
  const { usuario } = useAuth()
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState<Cuadratura | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCargando(true)
    setError(null)
    api.getCuadratura(fecha)
      .then(d => setData(d as Cuadratura))
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setCargando(false))
  }, [fecha])

  const esDueno = usuario?.rol === 'dueno'

  const metodos = data
    ? Object.entries(data.por_metodo_pago).filter(([, v]) => v > 0)
    : []

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Caja</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cuadratura del día</p>
        </div>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-zinc-600 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">{error}</div>
      )}

      {cargando ? (
        <div className="text-center py-16 text-sm text-gray-400 animate-pulse">Cargando…</div>
      ) : !data ? null : (
        <div className="space-y-4">
          {/* Totales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">${Number(data.total).toLocaleString('es-CL')}</p>
              <p className="text-sm text-gray-400 mt-1">Total recaudado</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-green-600">{data.cantidad_citas}</p>
              <p className="text-sm text-gray-400 mt-1">Citas completadas</p>
            </div>
          </div>

          {/* Recaudado por barbero — solo dueno */}
          {esDueno && data.por_barbero.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recaudado por barbero</p>
              <div className="space-y-3">
                {data.por_barbero.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-32 truncate">{b.nombre}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-zinc-800 h-2 rounded-full transition-all"
                        style={{ width: `${data.total > 0 ? (Number(b.total) / Number(data.total)) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold text-gray-900">${Number(b.total).toLocaleString('es-CL')}</span>
                      <span className="text-xs text-gray-400 ml-1.5">{b.cantidad} citas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Por método de pago */}
          {metodos.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Por método de pago</p>
              <div className="space-y-2">
                {metodos.map(([metodo, total]) => (
                  <div key={metodo} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{METODO_LABEL[metodo] ?? metodo}</span>
                    <span className="font-semibold text-gray-900">${Number(total).toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.cantidad_citas === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">No hay citas completadas para esta fecha.</p>
          )}
        </div>
      )}
    </>
  )
}
