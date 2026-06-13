import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/entities/usuario.entity';

@Controller('servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  findAll() {
    return this.serviciosService.findAll();
  }

  @Post()
  @Roles(Rol.DUENO)
  create(@Body() dto: CreateServicioDto) {
    return this.serviciosService.create(dto);
  }

  @Put(':id')
  @Roles(Rol.DUENO)
  update(@Param('id') id: string, @Body() dto: UpdateServicioDto) {
    return this.serviciosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Rol.DUENO)
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(id);
  }
}
