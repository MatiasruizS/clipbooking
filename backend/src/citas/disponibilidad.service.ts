import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita, EstadoCita } from './entities/cita.entity';

const HORA_INICIO = '10:00';
const HORA_FIN = '20:45';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(Cita)
    private citasRepo: Repository<Cita>,
  ) {}

  async getSlots(barberoId: string, fecha: string, duracionMin: number): Promise<string[]> {
    const citasDelDia = await this.citasRepo.find({
      where: { barbero_id: barberoId, fecha, estado: EstadoCita.PENDIENTE },
    });

    // Rangos ocupados en minutos
    const ocupados = citasDelDia.map((c) => ({
      inicio: timeToMinutes(c.hora_inicio),
      fin: timeToMinutes(c.hora_fin),
    }));

    const slots: string[] = [];
    const inicio = timeToMinutes(HORA_INICIO);
    const fin = timeToMinutes(HORA_FIN);

    for (let t = inicio; t + duracionMin <= fin; t += duracionMin) {
      const slotFin = t + duracionMin;
      const solapado = ocupados.some((o) => t < o.fin && slotFin > o.inicio);
      if (!solapado) {
        slots.push(minutesToTime(t));
      }
    }

    return slots;
  }

  calcularHoraFin(horaInicio: string, duracionMin: number): string {
    return minutesToTime(timeToMinutes(horaInicio) + duracionMin);
  }
}
