import { z } from 'zod';

export const CreateTypeCommonAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
});

export const UpdateTypeCommonAreaSchema = z
  .object({
    name: z.string().min(1, 'El nombre debe tener al menos 1 carácter').optional(),
    description: z.string().min(1, 'La descripción debe tener al menos 1 carácter').optional(),
  })
  .refine(
    (data) => {
      // Al menos uno de los campos debe estar presente
      return data.name !== undefined || data.description !== undefined;
    },
    {
      message: 'Al menos uno de los campos (nombre o descripción) debe estar presente',
      path: ['name', 'description'],
    },
  );

export const TypeCommonAreaQuerySchema = z.object({
  page: z.coerce.number().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.coerce
    .number()
    .min(1, 'El límite debe ser mayor a 0')
    .max(100, 'El límite no puede exceder 100')
    .default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'description', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const TypeCommonAreaIdSchema = z.object({
  id: z.coerce.number().min(1, 'El ID debe ser mayor a 0'),
});

export const FilterTypeCommonAreaSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const TypeCommonAreaByApartmentSchema = z.object({
  apartmentId: z.coerce.number().min(1, 'El ID del apartamento debe ser mayor a 0'),
});

export const UniqueTypeCommonAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export type CreateTypeCommonAreaDto = z.infer<typeof CreateTypeCommonAreaSchema>;
export type UpdateTypeCommonAreaDto = z.infer<typeof UpdateTypeCommonAreaSchema>;
export type TypeCommonAreaQueryDto = z.infer<typeof TypeCommonAreaQuerySchema>;
export type TypeCommonAreaIdDto = z.infer<typeof TypeCommonAreaIdSchema>;
export type FilterTypeCommonAreaDto = z.infer<typeof FilterTypeCommonAreaSchema>;
export type TypeCommonAreaByApartmentDto = z.infer<typeof TypeCommonAreaByApartmentSchema>;
export type UniqueTypeCommonAreaDto = z.infer<typeof UniqueTypeCommonAreaSchema>;
