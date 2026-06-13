'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Cita } from '@/lib/types'
import CitaCard from '@/components/barbero/CitaCard'
import ModalPago from '@/components/barbero/ModalPago'
function monto(c: Cita) { return Number(c.monto) || 0 }

export default function AdminAgendaPage() {
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

  async function handleCancelar(id: string) {
    if (!confirm('¿Cancelar esta cita?')) return
    try {
      await api.cancelarCita(id)
      await cargarCitas()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al cancelar')
    }
  }

  const pendientes = citas.filter(c => c.estado === 'pendiente')
  const completadas = citas.filter(c => c.estado === 'completada')
  const canceladas = citas.filter(c => c.estado === 'cancelada')
  const totalDia = completadas.reduce((acc, c) => acc + monto(c), 0)

  const hoy = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  if (cargando) {
    return <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">Cargando citas…</div>
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 capitalize">{hoy}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Agenda del día — todos los barberos</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Pendientes" value={pendientes.length} color="text-amber-600" />
        <Stat label="Completadas" value={completadas.length} color="text-green-600" />
        <Stat label="Canceladas" value={canceladas.length} color="text-red-500" />
        <Stat label="Total día" value={`$${totalDia.toLocaleString('es-CL')}`} color="text-blue-600" />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">{error}</div>
      )}

      {citas.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No hay citas para hoy.</div>
      ) : (
        <div className="space-y-4">
          {pendientes.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pendientes</p>
              <div className="space-y-3">
                {pendientes.map(c => (
                  <AdminCitaCard
                    key={c.id}
                    cita={c}
                    onCompletar={id => setCitaActiva(id)}
                    onCancelar={handleCancelar}
                  />
                ))}
              </div>
            </section>
          )}

          {completadas.length > 0 && (
            <section className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Completadas</p>
              <div className="space-y-3">
                {completadas.map(c => (
                  <AdminCitaCard key={c.id} cita={c} onCompletar={() => {}} onCancelar={() => {}} />
                ))}
              </div>
            </section>
          )}

          {canceladas.length > 0 && (
            <section className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Canceladas</p>
              <div className="space-y-3">
                {canceladas.map(c => (
                  <AdminCitaCard key={c.id} cita={c} onCompletar={() => {}} onCancelar={() => {}} />
                ))}
              </div>
            </section>
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

function AdminCitaCard({
  cita,
  onCompletar,
  onCancelar,
}: {
  cita: Cita
  onCompletar: (id: string) => void
  onCancelar: (id: string) => void
}) {
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

  const hora = cita.hora_inicio?.slice(0, 5)
  const horaFin = cita.hora_fin?.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">{hora} – {horaFin}</p>
          <p className="text-sm text-gray-500">{cita.barbero?.nombre ?? '—'} · {cita.servicio?.nombre ?? '—'}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_BADGE[cita.estado]}`}>
          {ESTADO_LABEL[cita.estado]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-sm text-gray-600 border-t border-gray-50 pt-3">
        <div>
          <span className="text-xs text-gray-400 block">Cliente</span>
          {cita.cliente?.nombre ?? '—'}
        </div>
        <div>
          <span className="text-xs text-gray-400 block">Teléfono</span>
          {cita.cliente?.telefono ?? '—'}
        </div>
        <div>
          <span className="text-xs text-gray-400 block">Monto</span>
          ${cita.monto?.toLocaleString('es-CL')}
          {cita.metodo_pago && <span className="text-xs text-gray-400 ml-1">({cita.metodo_pago})</span>}
        </div>
      </div>

      {cita.estado === 'pendiente' && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onCancelar(cita.id)}
            className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onCompletar(cita.id)}
            className="flex-1 rounded-xl bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition"
          >
            Completar
          </button>
        </div>
      )}
    </div>
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
