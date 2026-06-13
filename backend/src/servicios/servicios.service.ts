import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private serviciosRepo: Repository<Servicio>,
  ) {}

  findAll() {
    return this.serviciosRepo.find({ order: { nombre: 'ASC' } });
  }

  findActivos() {
    return this.serviciosRepo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string) {
    const servicio = await this.serviciosRepo.findOne({ where: { id } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  create(dto: CreateServicioDto) {
    const servicio = this.serviciosRepo.create(dto);
    return this.serviciosRepo.save(servicio);
  }

  async update(id: string, dto: UpdateServicioDto) {
    const servicio = await this.findOne(id);
    Object.assign(servicio, dto);
    return this.serviciosRepo.save(servicio);
  }

  async remove(id: string) {
    const servicio = await this.findOne(id);
    servicio.activo = false;
    return this.serviciosRepo.save(servicio);
  }
}
