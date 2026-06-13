'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Cita } from '@/lib/types'
import CitaCard from '@/components/barbero/CitaCard'
import ModalPago from '@/components/barbero/ModalPago'

export default function BarberoPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [citaActiva, setCitaActiva] = useState<string | null>(null)

  const cargarCitas = useCallback(async () => {
    try {
      const data = await api.getCitasHoy()
      setCitas(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar citas')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarCitas() }, [cargarCitas])

  async function handleCompletar(id: string, metodo: 'efectivo' | 'debito' | 'transferencia', notas: string) {
    await api.completarCita(id, metodo, notas || undefined)
    setCitaActiva(null)
    await cargarCitas()
  }

  const pendientes = citas.filter(c => c.estado === 'pendiente')
  const completadas = citas.filter(c => c.estado === 'completada')
  const totalDia = completadas.reduce((acc, c) => acc + (Number(c.monto) || 0), 0)

  const hoy = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-400 animate-pulse">Cargando citas…</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 capitalize">{hoy}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tus citas de hoy</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Pendientes" value={pendientes.length} color="text-amber-600" />
        <Stat label="Completadas" value={completadas.length} color="text-green-600" />
        <Stat label="Total día" value={`$${totalDia.toLocaleString('es-CL')}`} color="text-blue-600" />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {citas.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No tienes citas para hoy.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pendientes primero */}
          {pendientes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pendientes</p>
              <div className="space-y-3">
                {pendientes.map(c => (
                  <CitaCard key={c.id} cita={c} onCompletar={id => setCitaActiva(id)} />
                ))}
              </div>
            </div>
          )}

          {completadas.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Completadas</p>
              <div className="space-y-3">
                {completadas.map(c => (
                  <CitaCard key={c.id} cita={c} onCompletar={() => {}} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {citaActiva && (
        <ModalPago
          citaId={citaActiva}
          onConfirmar={handleCompletar}
          onCerrar={() => setCitaActiva(null)}
        />
      )}
    </>
  )
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
