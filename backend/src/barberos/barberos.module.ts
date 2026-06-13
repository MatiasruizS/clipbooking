import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barbero } from './entities/barbero.entity';
import { BarberosController } from './barberos.controller';
import { BarberosService } from './barberos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Barbero])],
  controllers: [BarberosController],
  providers: [BarberosService],
  exports: [BarberosService],
})
export class BarberosModule {}
