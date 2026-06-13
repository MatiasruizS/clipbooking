import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita, EstadoCita, MetodoPago } from '../citas/entities/cita.entity';

@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(Cita)
    private citasRepo: Repository<Cita>,
  ) {}

  async getCuadratura(fecha: string) {
    const citas = await this.citasRepo.find({
      where: { fecha, estado: EstadoCita.COMPLETADA },
      relations: { barbero: true, servicio: true, cliente: true },
      order: { hora_inicio: 'ASC' },
    });

    const total = citas.reduce((sum, c) => sum + Number(c.monto), 0);

    const porBarbero: Record<string, { nombre: string; total: number; cantidad: number }> = {};
    const porMetodoPago: Record<string, number> = {
      [MetodoPago.EFECTIVO]: 0,
      [MetodoPago.DEBITO]: 0,
      [MetodoPago.TRANSFERENCIA]: 0,
    };

    for (const cita of citas) {
      const bid = cita.barbero_id;
      if (!porBarbero[bid]) {
        porBarbero[bid] = { nombre: cita.barbero.nombre, total: 0, cantidad: 0 };
      }
      porBarbero[bid].total += Number(cita.monto);
      porBarbero[bid].cantidad += 1;

      if (cita.metodo_pago) {
        porMetodoPago[cita.metodo_pago] = (porMetodoPago[cita.metodo_pago] ?? 0) + Number(cita.monto);
      }
    }

    return {
      fecha,
      total,
      cantidad_citas: citas.length,
      por_barbero: Object.values(porBarbero),
      por_metodo_pago: porMetodoPago,
      citas,
    };
  }
}
