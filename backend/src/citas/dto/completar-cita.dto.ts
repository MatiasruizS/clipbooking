import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MetodoPago } from '../entities/cita.entity';

export class CompletarCitaDto {
  @IsEnum(MetodoPago, { message: 'Método de pago inválido' })
  metodo_pago: MetodoPago;

  @IsOptional()
  @IsString()
  notas?: string;
}
