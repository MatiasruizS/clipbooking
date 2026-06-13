import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Cita, EstadoCita } from '../citas/entities/cita.entity';
import { BarberosService } from '../barberos/barberos.service';
import { ServiciosService } from '../servicios/servicios.service';
import { ClientesService } from '../clientes/clientes.service';
import { DisponibilidadService } from '../citas/disponibilidad.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CrearCitaPublicaDto } from './dto/crear-cita-publica.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Cita)
    private citasRepo: Repository<Cita>,
    private barberosService: BarberosService,
    private serviciosService: ServiciosService,
    private clientesService: ClientesService,
    private disponibilidadService: DisponibilidadService,
    private notificacionesService: NotificacionesService,
  ) {}

  getBarberos() {
    return this.barberosService.findActivos();
  }

  getServicios() {
    return this.serviciosService.findActivos();
  }

  async getDisponibilidad(barberoId: string, fecha: string, servicioId: string) {
    const servicio = await this.serviciosService.findOne(servicioId);
    const slots = await this.disponibilidadService.getSlots(barberoId, fecha, servicio.duracion_min);
    return { slots, duracion_min: servicio.duracion_min };
  }

  async crearCita(dto: CrearCitaPublicaDto) {
    const [barbero, servicio] = await Promise.all([
      this.barberosService.findOne(dto.barbero_id),
      this.serviciosService.findOne(dto.servicio_id),
    ]);

    const slotsDisponibles = await this.disponibilidadService.getSlots(
      dto.barbero_id,
      dto.fecha,
      servicio.duracion_min,
    );

    if (!slotsDisponibles.includes(dto.hora_inicio)) {
      throw new BadRequestException('El horario seleccionado no está disponible');
    }

    const cliente = await this.clientesService.findOrCreate(
      dto.nombre_cliente,
      dto.telefono_cliente,
      dto.email_cliente,
    );

    const hora_fin = this.disponibilidadService.calcularHoraFin(
      dto.hora_inicio,
      servicio.duracion_min,
    );

    const cita = this.citasRepo.create({
      barbero_id: barbero.id,
      servicio_id: servicio.id,
      cliente_id: cliente.id,
      fecha: dto.fecha,
      hora_inicio: dto.hora_inicio,
      hora_fin,
      monto: servicio.precio,
      estado: EstadoCita.PENDIENTE,
      notas: dto.notas,
      cancelacion_token: randomUUID(),
    });

    const citaGuardada = await this.citasRepo.save(cita);

    // Notificaciones en background — no bloquean la respuesta al cliente
    this.notificacionesService.enviarConfirmacion({
      clienteNombre: dto.nombre_cliente,
      clienteTelefono: dto.telefono_cliente,
      clienteEmail: dto.email_cliente,
      barberoNombre: barbero.nombre,
      servicioNombre: servicio.nombre,
      fecha: dto.fecha,
      horaInicio: dto.hora_inicio,
      monto: Number(servicio.precio),
    });

    return this.citasRepo.findOne({
      where: { id: citaGuardada.id },
      relations: { barbero: true, servicio: true, cliente: true },
    });
  }
}
