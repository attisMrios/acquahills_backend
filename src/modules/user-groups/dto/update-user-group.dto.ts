import { z } from 'zod';

/**
 * Schema para actualizar grupo de usuarios
 */
export const updateUserGroupSchema = z.object({
  name: z.string().min(2, 'El nombre del grupo debe tener al menos 2 caracteres').max(100, 'El nombre del grupo no puede exceder 100 caracteres').optional(),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional()
});

export type UpdateUserGroupDto = z.infer<typeof updateUserGroupSchema>;