import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updatePropertyOwnerSchema = z.object({
  userId: z.string().min(1, 'El ID del usuario es requerido').optional(),
  apartmentId: z.number().int().positive('El ID del apartamento debe ser un número entero positivo').optional(),
});

export class UpdatePropertyOwnerDto extends createZodDto(updatePropertyOwnerSchema) {} 