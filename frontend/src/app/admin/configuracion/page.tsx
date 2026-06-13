'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Barbero, Servicio, Usuario } from '@/lib/types'

type Tab = 'barberos' | 'servicios' | 'usuarios'
type UsuarioAdmin = Usuario & { activo: boolean }

export default function ConfiguracionPage() {
  const { usuario } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('barberos')

  useEffect(() => {
    if (usuario && usuario.rol !== 'dueno') router.replace('/admin')
  }, [usuario, router])

  if (!usuario || usuario.rol !== 'dueno') return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona barberos, servicios y usuarios del sistema</p>
      </div>

      <div className="flex gap-0 mb-6 border-b border-gray-200">
        {(['barberos', 'servicios', 'usuarios'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              tab === t
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'barberos' && <TabBarberos />}
      {tab === 'servicios' && <TabServicios />}
      {tab === 'usuarios' && <TabUsuarios />}
    </div>
  )
}

// ─── Tab Barberos ────────────────────────────────────────────────────────────

type FormBarbero = { id: string | null; nombre: string; telefono: string }

function TabBarberos() {
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState<FormBarbero | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try { setBarberos(await api.getBarberosAdmin()) }
    finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function abrirNuevo() { setForm({ id: null, nombre: '', telefono: '' }); setError(null) }
  function abrirEditar(b: Barbero) { setForm({ id: b.id, nombre: b.nombre, telefono: b.telefono ?? '' }); setError(null) }

  async function guardar() {
    if (!form?.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setGuardando(true); setError(null)
    try {
      const payload = { nombre: form.nombre.trim(), telefono: form.telefono.trim() || undefined }
      if (form.id) await api.updateBarbero(form.id, payload)
      else await api.createBarbero(payload)
      setForm(null); await cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally { setGuardando(false) }
  }

  async function toggleActivo(b: Barbero) {
    if (!confirm(b.activo ? `¿Desactivar a ${b.nombre}?` : `¿Activar a ${b.nombre}?`)) return
    try { await api.updateBarbero(b.id, { activo: !b.activo }); await cargar() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
  }

  if (cargando) return <Cargando />

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{barberos.length} barbero{barberos.length !== 1 ? 's' : ''}</p>
        <button onClick={abrirNuevo} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition">
          + Nuevo barbero
        </button>
      </div>

      {form && (
        <FormCard titulo={form.id ? 'Editar barbero' : 'Nuevo barbero'} error={error} guardando={guardando} onGuardar={guardar} onCancelar={() => setForm(null)}>
          <Campo label="Nombre *">
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={INPUT} placeholder="Nombre del barbero" />
          </Campo>
          <Campo label="Teléfono (opcional)">
            <input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
              className={INPUT} placeholder="+56912345678" />
          </Campo>
        </FormCard>
      )}

      <div className="space-y-2">
        {barberos.map(b => (
          <FilaItem key={b.id} activo={b.activo}
            titulo={b.nombre}
            subtitulo={`${b.telefono ?? 'Sin teléfono'} · ${b.activo ? 'Activo' : 'Inactivo'}`}
            onEditar={() => abrirEditar(b)}
            onToggle={() => toggleActivo(b)}
          />
        ))}
        {barberos.length === 0 && <Vacio texto="No hay barberos. Agrega el primero." />}
      </div>
    </div>
  )
}

// ─── Tab Servicios ───────────────────────────────────────────────────────────

type FormServicio = { id: string | null; nombre: string; duracion_min: string; precio: string }

function TabServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState<FormServicio | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try { setServicios(await api.getServiciosAdmin()) }
    finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function abrirNuevo() { setForm({ id: null, nombre: '', duracion_min: '', precio: '' }); setError(null) }
  function abrirEditar(s: Servicio) {
    setForm({ id: s.id, nombre: s.nombre, duracion_min: String(s.duracion_min), precio: String(s.precio) })
    setError(null)
  }

  async function guardar() {
    if (!form) return
    const dur = parseInt(form.duracion_min)
    const prec = parseFloat(form.precio)
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!dur || dur <= 0) { setError('La duración debe ser mayor a 0'); return }
    if (!prec || prec <= 0) { setError('El precio debe ser mayor a 0'); return }
    setGuardando(true); setError(null)
    try {
      const payload = { nombre: form.nombre.trim(), duracion_min: dur, precio: prec }
      if (form.id) await api.updateServicio(form.id, payload)
      else await api.createServicio(payload)
      setForm(null); await cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally { setGuardando(false) }
  }

  async function toggleActivo(s: Servicio) {
    if (!confirm(s.activo ? `¿Desactivar "${s.nombre}"?` : `¿Activar "${s.nombre}"?`)) return
    try { await api.updateServicio(s.id, { activo: !s.activo }); await cargar() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
  }

  if (cargando) return <Cargando />

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{servicios.length} servicio{servicios.length !== 1 ? 's' : ''}</p>
        <button onClick={abrirNuevo} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition">
          + Nuevo servicio
        </button>
      </div>

      {form && (
        <FormCard titulo={form.id ? 'Editar servicio' : 'Nuevo servicio'} error={error} guardando={guardando} onGuardar={guardar} onCancelar={() => setForm(null)}>
          <Campo label="Nombre *">
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={INPUT} placeholder="Ej: Corte de cabello" />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Duración (min) *">
              <input type="number" min={5} value={form.duracion_min} onChange={e => setForm({ ...form, duracion_min: e.target.value })}
                className={INPUT} placeholder="30" />
            </Campo>
            <Campo label="Precio ($) *">
              <input type="number" min={0} value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })}
                className={INPUT} placeholder="8000" />
            </Campo>
          </div>
        </FormCard>
      )}

      <div className="space-y-2">
        {servicios.map(s => (
          <FilaItem key={s.id} activo={s.activo}
            titulo={s.nombre}
            subtitulo={`${s.duracion_min} min · $${Number(s.precio).toLocaleString('es-CL')} · ${s.activo ? 'Activo' : 'Inactivo'}`}
            onEditar={() => abrirEditar(s)}
            onToggle={() => toggleActivo(s)}
          />
        ))}
        {servicios.length === 0 && <Vacio texto="No hay servicios. Agrega el primero." />}
      </div>
    </div>
  )
}

// ─── Tab Usuarios ────────────────────────────────────────────────────────────

type FormUsuario = {
  id: string | null
  nombre: string
  email: string
  password: string
  rol: 'dueno' | 'barbero' | 'recepcion'
  barbero_id: string
}

function TabUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState<FormUsuario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try {
      const [u, b] = await Promise.all([api.getUsuarios(), api.getBarberosAdmin()])
      setUsuarios(u)
      setBarberos(b.filter(b => b.activo))
    } finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function abrirNuevo() {
    setForm({ id: null, nombre: '', email: '', password: '', rol: 'barbero', barbero_id: '' })
    setError(null)
  }

  function abrirEditar(u: UsuarioAdmin) {
    setForm({ id: u.id, nombre: u.nombre, email: u.email, password: '', rol: u.rol, barbero_id: u.barbero_id ?? '' })
    setError(null)
  }

  async function guardar() {
    if (!form) return
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.email.trim()) { setError('El email es obligatorio'); return }
    if (!form.id && !form.password) { setError('La contraseña es obligatoria'); return }
    if (form.rol === 'barbero' && !form.barbero_id) { setError('Debes seleccionar el barbero vinculado'); return }
    setGuardando(true); setError(null)
    try {
      if (form.id) {
        const payload: Parameters<typeof api.updateUsuario>[1] = {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          rol: form.rol,
          barbero_id: form.rol === 'barbero' ? form.barbero_id : null,
        }
        if (form.password) payload.password = form.password
        await api.updateUsuario(form.id, payload)
      } else {
        await api.createUsuario({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
          barbero_id: form.rol === 'barbero' ? form.barbero_id : undefined,
        })
      }
      setForm(null); await cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally { setGuardando(false) }
  }

  async function toggleActivo(u: UsuarioAdmin) {
    if (!confirm(u.activo ? `¿Desactivar a ${u.nombre}?` : `¿Activar a ${u.nombre}?`)) return
    try { await api.updateUsuario(u.id, { activo: !u.activo }); await cargar() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
  }

  const ROL_LABEL: Record<string, string> = { dueno: 'Dueño', barbero: 'Barbero', recepcion: 'Recepción' }

  if (cargando) return <Cargando />

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</p>
        <button onClick={abrirNuevo} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition">
          + Nuevo usuario
        </button>
      </div>

      {form && (
        <FormCard titulo={form.id ? 'Editar usuario' : 'Nuevo usuario'} error={error} guardando={guardando} onGuardar={guardar} onCancelar={() => setForm(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Nombre *">
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={INPUT} placeholder="Nombre completo" />
            </Campo>
            <Campo label="Email *">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className={INPUT} placeholder="usuario@ejemplo.cl" />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label={form.id ? 'Nueva contraseña (opcional)' : 'Contraseña *'}>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className={INPUT} placeholder={form.id ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'} />
            </Campo>
            <Campo label="Rol *">
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value as FormUsuario['rol'], barbero_id: '' })}
                className={INPUT}>
                <option value="dueno">Dueño</option>
                <option value="recepcion">Recepción</option>
                <option value="barbero">Barbero</option>
              </select>
            </Campo>
          </div>
          {form.rol === 'barbero' && (
            <Campo label="Barbero vinculado *">
              <select value={form.barbero_id} onChange={e => setForm({ ...form, barbero_id: e.target.value })} className={INPUT}>
                <option value="">Selecciona un barbero…</option>
                {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </Campo>
          )}
        </FormCard>
      )}

      <div className="space-y-2">
        {usuarios.map(u => (
          <FilaItem key={u.id} activo={u.activo}
            titulo={u.nombre}
            subtitulo={`${u.email} · ${ROL_LABEL[u.rol]} · ${u.activo ? 'Activo' : 'Inactivo'}`}
            onEditar={() => abrirEditar(u)}
            onToggle={() => toggleActivo(u)}
          />
        ))}
        {usuarios.length === 0 && <Vacio texto="No hay usuarios." />}
      </div>
    </div>
  )
}

// ─── Componentes compartidos ─────────────────────────────────────────────────

const INPUT = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white'

function FormCard({ titulo, error, guardando, onGuardar, onCancelar, children }: {
  titulo: string
  error: string | null
  guardando: boolean
  onGuardar: () => void
  onCancelar: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-800 mb-3">{titulo}</p>
      {error && <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      <div className="grid gap-3">{children}</div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancelar} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button onClick={onGuardar} disabled={guardando} className="flex-1 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-40 transition">
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  )
}

function FilaItem({ titulo, subtitulo, activo, onEditar, onToggle }: {
  titulo: string
  subtitulo: string
  activo: boolean
  onEditar: () => void
  onToggle: () => void
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3 ${!activo ? 'opacity-50' : ''}`}>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{titulo}</p>
        <p className="text-xs text-gray-400 truncate">{subtitulo}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEditar} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition">
          Editar
        </button>
        <button onClick={onToggle} className={`text-xs px-2 py-1.5 rounded-lg transition ${activo ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
          {activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

function Cargando() {
  return <div className="text-sm text-gray-400 animate-pulse py-12 text-center">Cargando…</div>
}

function Vacio({ texto }: { texto: string }) {
  return <div className="text-center py-12 text-gray-400 text-sm">{texto}</div>
}
