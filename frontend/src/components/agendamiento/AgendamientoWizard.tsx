'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Barbero, Servicio } from '@/lib/types'
import { api } from '@/lib/api'
import StepServicio from './StepServicio'
import StepBarbero from './StepBarbero'
import StepFecha from './StepFecha'
import StepHorario from './StepHorario'
import StepDatos, { type DatosCliente } from './StepDatos'
import StepConfirmacion from './StepConfirmacion'

type Paso = 'servicio' | 'barbero' | 'fecha' | 'horario' | 'datos' | 'confirmacion'

const PASOS: Paso[] = ['servicio', 'barbero', 'fecha', 'horario', 'datos', 'confirmacion']
const PASO_LABEL: Record<Paso, string> = {
  servicio: 'Servicio',
  barbero: 'Barbero',
  fecha: 'Fecha',
  horario: 'Horario',
  datos: 'Tus datos',
  confirmacion: 'Listo',
}

interface Props {
  servicios: Servicio[]
  barberos: Barbero[]
}

const DATOS_VACIOS: DatosCliente = { nombre: '', telefono: '', email: '', notas: '' }

export default function AgendamientoWizard({ servicios, barberos }: Props) {
  const [paso, setPaso] = useState<Paso>('servicio')
  const [servicioId, setServicioId] = useState<string | null>(null)
  const [barberoId, setBarberoId] = useState<string | null>(null)
  const [fecha, setFecha] = useState<string | null>(null)
  const [hora, setHora] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [datos, setDatos] = useState<DatosCliente>(DATOS_VACIOS)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [citaConfirmada, setCitaConfirmada] = useState<{ fecha: string; hora: string; nombre: string } | null>(null)

  const pasoIndex = PASOS.indexOf(paso)
  const servicio = servicios.find((s) => s.id === servicioId)
  const barbero = barberos.find((b) => b.id === barberoId)

  // Cargar slots cuando hay barbero + fecha + servicio
  const cargarSlots = useCallback(async () => {
    if (!barberoId || !fecha || !servicioId) return
    setCargandoSlots(true)
    setSlots([])
    setHora(null)
    try {
      const { slots: s } = await api.getDisponibilidad(barberoId, fecha, servicioId)
      setSlots(s)
    } catch {
      setSlots([])
    } finally {
      setCargandoSlots(false)
    }
  }, [barberoId, fecha, servicioId])

  useEffect(() => {
    if (paso === 'horario') cargarSlots()
  }, [paso, cargarSlots])

  function siguiente() {
    setError(null)
    const idx = PASOS.indexOf(paso)
    if (idx < PASOS.length - 1) setPaso(PASOS[idx + 1])
  }

  function anterior() {
    setError(null)
    const idx = PASOS.indexOf(paso)
    if (idx > 0) setPaso(PASOS[idx - 1])
  }

  function reiniciar() {
    setServicioId(null)
    setBarberoId(null)
    setFecha(null)
    setHora(null)
    setSlots([])
    setDatos(DATOS_VACIOS)
    setCitaConfirmada(null)
    setError(null)
    setPaso('servicio')
  }

  async function confirmar() {
    if (!servicioId || !barberoId || !fecha || !hora || !datos.nombre || !datos.telefono) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await api.crearCita({
        barbero_id: barberoId,
        servicio_id: servicioId,
        fecha,
        hora_inicio: hora,
        nombre_cliente: datos.nombre,
        telefono_cliente: datos.telefono,
        email_cliente: datos.email || undefined,
        notas: datos.notas || undefined,
      })
      setCitaConfirmada({ fecha, hora, nombre: datos.nombre })
      setPaso('confirmacion')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al confirmar la cita.')
    } finally {
      setEnviando(false)
    }
  }

  const puedeSiguiente: Record<Paso, boolean> = {
    servicio: !!servicioId,
    barbero: !!barberoId,
    fecha: !!fecha,
    horario: !!hora,
    datos: !!datos.nombre && !!datos.telefono,
    confirmacion: false,
  }

  const esUltimoPaso = paso === 'datos'

  if (paso === 'confirmacion' && citaConfirmada && servicio && barbero) {
    return (
      <StepConfirmacion
        cita={{ servicio, barbero, fecha: citaConfirmada.fecha, hora: citaConfirmada.hora, nombre: citaConfirmada.nombre, telefono: datos.telefono }}
        onNueva={reiniciar}
      />
    )
  }

  return (
    <div>
      {/* Indicador de pasos */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {PASOS.filter((p) => p !== 'confirmacion').map((p, i) => {
          const completado = i < pasoIndex
          const actual = p === paso
          return (
            <div key={p} className="flex items-center gap-1 shrink-0">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors
                ${actual ? 'bg-zinc-900 text-white' : completado ? 'bg-zinc-200 text-zinc-700' : 'bg-gray-100 text-gray-400'}`}>
                {completado ? '✓' : i + 1}
              </div>
              <span className={`hidden sm:block text-xs ${actual ? 'text-zinc-900 font-semibold' : 'text-gray-400'}`}>
                {PASO_LABEL[p]}
              </span>
              {i < PASOS.length - 2 && <div className="mx-1 h-px w-4 bg-gray-200 sm:w-6" />}
            </div>
          )
        })}
      </div>

      {/* Contenido del paso */}
      <div className="min-h-64">
        {paso === 'servicio' && (
          <StepServicio servicios={servicios} seleccionado={servicioId} onSelect={setServicioId} />
        )}
        {paso === 'barbero' && (
          <StepBarbero barberos={barberos} seleccionado={barberoId} onSelect={setBarberoId} />
        )}
        {paso === 'fecha' && (
          <StepFecha seleccionada={fecha} onSelect={setFecha} />
        )}
        {paso === 'horario' && (
          <StepHorario slots={slots} cargando={cargandoSlots} seleccionado={hora} onSelect={setHora} />
        )}
        {paso === 'datos' && (
          <StepDatos datos={datos} onChange={setDatos} />
        )}
      </div>

      {/* Resumen selección */}
      {paso !== 'servicio' && paso !== 'confirmacion' && (servicio || barbero || fecha || hora) && (
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          {servicio && <Chip label={servicio.nombre} />}
          {barbero && <Chip label={barbero.nombre} />}
          {fecha && <Chip label={fecha} />}
          {hora && <Chip label={hora} />}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Navegación */}
      <div className="mt-6 flex gap-3">
        {pasoIndex > 0 && (
          <button
            onClick={anterior}
            disabled={enviando}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition focus:outline-none"
          >
            Atrás
          </button>
        )}
        <button
          onClick={esUltimoPaso ? confirmar : siguiente}
          disabled={!puedeSiguiente[paso] || enviando}
          className="flex-1 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {enviando ? 'Confirmando…' : esUltimoPaso ? 'Confirmar reserva' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 font-medium">{label}</span>
  )
}
