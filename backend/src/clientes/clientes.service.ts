import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepo: Repository<Cliente>,
  ) {}

  async findOrCreate(nombre: string, telefono: string, email?: string): Promise<Cliente> {
    let cliente = await this.clientesRepo.findOne({ where: { telefono } });
    if (!cliente) {
      cliente = this.clientesRepo.create({ nombre, telefono, email });
      await this.clientesRepo.save(cliente);
    }
    return cliente;
  }

  findAll() {
    return this.clientesRepo.find({ order: { nombre: 'ASC' } });
  }
}
