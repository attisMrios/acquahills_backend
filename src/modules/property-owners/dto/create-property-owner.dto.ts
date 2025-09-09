import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createPropertyOwnerSchema = z.object({
  userId: z.string().min(1, 'El ID del usuario es requerido'),
  apartmentId: z
    .number()
    .int()
    .positive('El ID del apartamento debe ser un número entero positivo'),
});

const createPropertyOwnersBulkSchema = z.object({
  apartmentId: z
    .number()
    .int()
    .positive('El ID del apartamento debe ser un número entero positivo'),
  userIds: z
    .array(z.string().min(1, 'El ID del usuario es requerido'))
    .min(1, 'Debe incluir al menos un usuario'),
});

export class CreatePropertyOwnerDto extends createZodDto(createPropertyOwnerSchema) {}
export class CreatePropertyOwnersBulkDto extends createZodDto(createPropertyOwnersBulkSchema) {}
