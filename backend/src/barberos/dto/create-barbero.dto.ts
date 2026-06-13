import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBarberoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
