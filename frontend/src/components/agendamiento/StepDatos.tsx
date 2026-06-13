'use client'

export interface DatosCliente {
  nombre: string
  telefono: string
  email: string
  notas: string
}

interface Props {
  datos: DatosCliente
  onChange: (datos: DatosCliente) => void
}

export default function StepDatos({ datos, onChange }: Props) {
  const set = (field: keyof DatosCliente) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...datos, [field]: e.target.value })

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Tus datos</h2>
      <p className="text-sm text-gray-500 mb-6">Ingresa tu información para confirmar la reserva.</p>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Nombre completo <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={datos.nombre}
            onChange={set('nombre')}
            placeholder="Ej: Carlos Mendoza"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Teléfono <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={datos.telefono}
            onChange={set('telefono')}
            placeholder="Ej: +56 9 1234 5678"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Email <span className="text-gray-400 font-normal">(opcional)</span></label>
          <input
            type="email"
            value={datos.email}
            onChange={set('email')}
            placeholder="Ej: carlos@correo.com"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Notas <span className="text-gray-400 font-normal">(opcional)</span></label>
          <textarea
            value={datos.notas}
            onChange={set('notas')}
            placeholder="Ej: Me gustaría corte degradado con barba"
            rows={3}
            className={inputCls + ' resize-none'}
          />
        </div>
      </div>
    </div>
  )
}
