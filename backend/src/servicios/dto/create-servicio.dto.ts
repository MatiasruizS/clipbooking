import { IsString, IsNumber, IsPositive, IsOptional, IsBoolean } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @IsPositive()
  duracion_min: number;

  @IsNumber()
  @IsPositive()
  precio: number;
}
