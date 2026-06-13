import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barbero } from './entities/barbero.entity';
import { CreateBarberoDto } from './dto/create-barbero.dto';
import { UpdateBarberoDto } from './dto/update-barbero.dto';

@Injectable()
export class BarberosService {
  constructor(
    @InjectRepository(Barbero)
    private barberosRepo: Repository<Barbero>,
  ) {}

  findAll() {
    return this.barberosRepo.find({ order: { nombre: 'ASC' } });
  }

  findActivos() {
    return this.barberosRepo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string) {
    const barbero = await this.barberosRepo.findOne({ where: { id } });
    if (!barbero) throw new NotFoundException('Barbero no encontrado');
    return barbero;
  }

  create(dto: CreateBarberoDto) {
    const barbero = this.barberosRepo.create(dto);
    return this.barberosRepo.save(barbero);
  }

  async update(id: string, dto: UpdateBarberoDto) {
    const barbero = await this.findOne(id);
    Object.assign(barbero, dto);
    return this.barberosRepo.save(barbero);
  }

  async remove(id: string) {
    const barbero = await this.findOne(id);
    barbero.activo = false;
    return this.barberosRepo.save(barbero);
  }
}
