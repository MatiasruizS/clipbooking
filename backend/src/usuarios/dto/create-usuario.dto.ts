import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Rol } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(Rol, { message: 'Rol inválido' })
  rol: Rol;

  @IsOptional()
  @IsUUID()
  barbero_id?: string;
}
