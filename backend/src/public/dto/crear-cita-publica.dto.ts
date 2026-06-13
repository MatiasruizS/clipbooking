import { IsString, IsEmail, IsOptional, IsUUID, IsDateString, Matches } from 'class-validator';

export class CrearCitaPublicaDto {
  @IsUUID()
  barbero_id: string;

  @IsUUID()
  servicio_id: string;

  @IsDateString()
  fecha: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'Hora inválida, use formato HH:MM' })
  hora_inicio: string;

  @IsString()
  nombre_cliente: string;

  @IsString()
  telefono_cliente: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email_cliente?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
