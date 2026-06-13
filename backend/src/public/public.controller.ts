import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { PublicService } from './public.service';
import { CrearCitaPublicaDto } from './dto/crear-cita-publica.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('barberos')
  getBarberos() {
    return this.publicService.getBarberos();
  }

  @Get('servicios')
  getServicios() {
    return this.publicService.getServicios();
  }

  @Get('disponibilidad')
  getDisponibilidad(
    @Query('barbero_id') barberoId: string,
    @Query('fecha') fecha: string,
    @Query('servicio_id') servicioId: string,
  ) {
    return this.publicService.getDisponibilidad(barberoId, fecha, servicioId);
  }

  @Post('citas')
  crearCita(@Body() dto: CrearCitaPublicaDto) {
    return this.publicService.crearCita(dto);
  }
}
