import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from '../citas/entities/cita.entity';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { BarberosModule } from '../barberos/barberos.module';
import { ServiciosModule } from '../servicios/servicios.module';
import { ClientesModule } from '../clientes/clientes.module';
import { CitasModule } from '../citas/citas.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita]),
    BarberosModule,
    ServiciosModule,
    ClientesModule,
    CitasModule,
    NotificacionesModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
