import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita, EstadoCita } from './entities/cita.entity';
import { CompletarCitaDto } from './dto/completar-cita.dto';
import { Rol } from '../usuarios/entities/usuario.entity';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private citasRepo: Repository<Cita>,
  ) {}

  findAll(usuarioRol: string, usuarioBarberoId?: string) {
    if (usuarioRol === Rol.BARBERO && usuarioBarberoId) {
      return this.citasRepo.find({
        where: { barbero_id: usuarioBarberoId },
        relations: { barbero: true, servicio: true, cliente: true },
        order: { fecha: 'DESC', hora_inicio: 'ASC' },
      });
    }
    return this.citasRepo.find({
      relations: { barbero: true, servicio: true, cliente: true },
      order: { fecha: 'DESC', hora_inicio: 'ASC' },
    });
  }

  findHoy(usuarioRol: string, usuarioBarberoId?: string) {
    const hoy = new Date().toISOString().split('T')[0];
    const qb = this.citasRepo
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.barbero', 'barbero')
      .leftJoinAndSelect('cita.servicio', 'servicio')
      .leftJoinAndSelect('cita.cliente', 'cliente')
      .where('cita.fecha = :hoy', { hoy })
      .orderBy('cita.hora_inicio', 'ASC');

    if (usuarioRol === Rol.BARBERO && usuarioBarberoId) {
      qb.andWhere('cita.barbero_id = :bid', { bid: usuarioBarberoId });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const cita = await this.citasRepo.findOne({
      where: { id },
      relations: { barbero: true, servicio: true, cliente: true },
    });
    if (!cita) throw new NotFoundException('Cita no encontrada');
    return cita;
  }

  async completar(id: string, dto: CompletarCitaDto, usuario: any) {
    const cita = await this.findOne(id);

    if (cita.estado !== EstadoCita.PENDIENTE) {
      throw new BadRequestException('Solo se pueden completar citas pendientes');
    }

    if (usuario.rol === Rol.BARBERO && cita.barbero_id !== usuario.barbero_id) {
      throw new ForbiddenException('No puedes completar citas de otro barbero');
    }

    cita.estado = EstadoCita.COMPLETADA;
    cita.metodo_pago = dto.metodo_pago;
    if (dto.notas) cita.notas = dto.notas;

    return this.citasRepo.save(cita);
  }

  async cancelar(id: string, usuario: any) {
    const cita = await this.findOne(id);

    if (cita.estado === EstadoCita.COMPLETADA) {
      throw new BadRequestException('No se puede cancelar una cita ya completada');
    }

    if (usuario.rol === Rol.BARBERO) {
      throw new ForbiddenException('Los barberos no pueden cancelar citas');
    }

    cita.estado = EstadoCita.CANCELADA;
    return this.citasRepo.save(cita);
  }
}
