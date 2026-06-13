import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BarberosService } from './barberos.service';
import { CreateBarberoDto } from './dto/create-barbero.dto';
import { UpdateBarberoDto } from './dto/update-barbero.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/entities/usuario.entity';

@Controller('barberos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BarberosController {
  constructor(private readonly barberosService: BarberosService) {}

  @Get()
  findAll() {
    return this.barberosService.findAll();
  }

  @Post()
  @Roles(Rol.DUENO)
  create(@Body() dto: CreateBarberoDto) {
    return this.barberosService.create(dto);
  }

  @Put(':id')
  @Roles(Rol.DUENO)
  update(@Param('id') id: string, @Body() dto: UpdateBarberoDto) {
    return this.barberosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.DUENO)
  remove(@Param('id') id: string) {
    return this.barberosService.remove(id);
  }
}
