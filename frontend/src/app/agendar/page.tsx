import { getServicios, getBarberos } from '@/lib/cached-data'
import AgendamientoWizard from '@/components/agendamiento/AgendamientoWizard'

export const metadata = {
  title: 'Reservar cita | ClipBooking',
}

export default async function AgendarPage() {
  const [servicios, barberos] = await Promise.all([getServicios(), getBarberos()])

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">ClipBooking</h1>
          <p className="mt-1 text-sm text-gray-500">Reserva tu cita en segundos</p>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
          <AgendamientoWizard servicios={servicios} barberos={barberos} />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Horario de atención: 10:00 a 20:45 · Lunes a Domingo
        </p>
      </div>
    </main>
  )
}
