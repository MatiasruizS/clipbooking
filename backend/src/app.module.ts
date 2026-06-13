import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BarberosModule } from './barberos/barberos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ClientesModule } from './clientes/clientes.module';
import { CitasModule } from './citas/citas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CajaModule } from './caja/caja.module';
import { PublicModule } from './public/public.module';
import { Barbero } from './barberos/entities/barbero.entity';
import { Servicio } from './servicios/entities/servicio.entity';
import { Cliente } from './clientes/entities/cliente.entity';
import { Cita } from './citas/entities/cita.entity';
import { Usuario } from './usuarios/entities/usuario.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Barbero, Servicio, Cliente, Cita, Usuario],
        synchronize: true, // solo para desarrollo; usar migraciones en producción
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BarberosModule,
    ServiciosModule,
    ClientesModule,
    CitasModule,
    UsuariosModule,
    CajaModule,
    PublicModule,
  ],
})
export class AppModule {}
