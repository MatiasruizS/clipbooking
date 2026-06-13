import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
  ) {}

  findAll() {
    return this.usuariosRepo.find({
      select: { id: true, nombre: true, email: true, rol: true, barbero_id: true, activo: true, created_at: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string) {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      select: { id: true, nombre: true, email: true, rol: true, barbero_id: true, activo: true, created_at: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const existe = await this.usuariosRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('Ya existe un usuario con ese email');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepo.create({ ...dto, password: hash });
    const guardado = await this.usuariosRepo.save(usuario);

    const { password: _, ...result } = guardado;
    return result;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(usuario, dto);
    const guardado = await this.usuariosRepo.save(usuario);
    const { password: _, ...result } = guardado;
    return result;
  }

  async remove(id: string) {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.activo = false;
    const guardado = await this.usuariosRepo.save(usuario);
    const { password: _, ...result } = guardado;
    return result;
  }
}
