
import { z } from 'zod';

export const updateUserGroupSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es requerido').max(100, 'El nombre no puede exceder 100 caracteres').optional(),
  description: z.string().optional(),
});

export type UpdateUserGroupDto = z.infer<typeof updateUserGroupSchema>;