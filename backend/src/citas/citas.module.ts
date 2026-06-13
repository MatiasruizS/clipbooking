import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { DisponibilidadService } from './disponibilidad.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cita])],
  controllers: [CitasController],
  providers: [CitasService, DisponibilidadService],
  exports: [CitasService, DisponibilidadService],
})
export class CitasModule {}
