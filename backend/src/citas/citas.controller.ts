import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CompletarCitaDto } from './dto/completar-cita.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.citasService.findAll(req.user.rol, req.user.barbero_id);
  }

  @Get('hoy')
  findHoy(@Request() req: any) {
    return this.citasService.findHoy(req.user.rol, req.user.barbero_id);
  }

  @Put(':id/completar')
  completar(@Param('id') id: string, @Body() dto: CompletarCitaDto, @Request() req: any) {
    return this.citasService.completar(id, dto, req.user);
  }

  @Put(':id/cancelar')
  cancelar(@Param('id') id: string, @Request() req: any) {
    return this.citasService.cancelar(id, req.user);
  }
}
