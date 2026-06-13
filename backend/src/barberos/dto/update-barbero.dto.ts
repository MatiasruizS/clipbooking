import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateBarberoDto } from './create-barbero.dto';

export class UpdateBarberoDto extends PartialType(CreateBarberoDto) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
