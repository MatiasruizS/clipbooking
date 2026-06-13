import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CajaService } from './caja.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../usuarios/entities/usuario.entity';

@Controller('caja')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.DUENO, Rol.RECEPCION)
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('cuadratura')
  getCuadratura(@Query('fecha') fecha: string) {
    const fechaConsulta = fecha ?? new Date().toISOString().split('T')[0];
    return this.cajaService.getCuadratura(fechaConsulta);
  }
}
