import { z } from 'zod';

export const createUserGroupSchema = z.object({
    name: z.string().min(1, 'El nombre del grupo es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    description: z.string().optional(),
  });
  
  export const createUserGroupMembersBulkSchema = z.object({
    userGroupId: z.string().min(1, 'El ID del grupo es requerido'),
    userIds: z.array(z.string().min(1, 'El ID del usuario es requerido')).min(1, 'Debe incluir al menos un usuario'),
  });

export type CreateUserGroupMembersBulkDto = z.infer<typeof createUserGroupMembersBulkSchema>;
export type CreateUserGroupDto = z.infer<typeof createUserGroupSchema>;