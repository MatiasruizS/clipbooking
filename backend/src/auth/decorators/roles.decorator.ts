import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../usuarios/entities/usuario.entity';
import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
