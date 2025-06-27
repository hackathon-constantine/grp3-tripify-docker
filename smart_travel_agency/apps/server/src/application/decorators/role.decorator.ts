import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '@prisma/client';

export const Roles = (...roles: UserRoles[]) => SetMetadata('roles', roles);