import { z } from 'zod';

/**
 * DTOs con validación Zod para el módulo de apartamentos
 */

// Schema para crear apartamento
export const CreateApartmentSchema = z.object({
  apartment: z.string()
    .min(1, 'El número de apartamento es requerido')
    .max(10, 'El número de apartamento no puede exceder 10 caracteres'),
  house: z.string()
    .min(1, 'La casa o edificio es requerido')
    .max(50, 'La casa o edificio no puede exceder 50 caracteres'),
  fullAddress: z.string()
    .min(1, 'La dirección completa es requerida')
    .max(150, 'La dirección completa no puede exceder 150 caracteres'),
  block: z.string()
    .min(1, 'El bloque es requerido')
    .max(10, 'El bloque no puede exceder 10 caracteres'),
  floor: z.string()
    .min(1, 'El piso es requerido')
    .max(10, 'El piso no puede exceder 10 caracteres'),
  tower: z.string()
    .min(1, 'La torre es requerida')
    .max(10, 'La torre no puede exceder 10 caracteres')
});

// Schema para actualizar apartamento
export const UpdateApartmentSchema = z.object({
  apartment: z.string()
    .min(1, 'El número de apartamento es requerido')
    .max(10, 'El número de apartamento no puede exceder 10 caracteres')
    .optional(),
  house: z.string()
    .min(1, 'La casa o edificio es requerido')
    .max(50, 'La casa o edificio no puede exceder 50 caracteres')
    .optional(),
  fullAddress: z.string()
    .min(1, 'La dirección completa es requerida')
    .max(150, 'La dirección completa no puede exceder 150 caracteres')
    .optional(),
  block: z.string()
    .min(1, 'El bloque es requerido')
    .max(10, 'El bloque no puede exceder 10 caracteres')
    .optional(),
  floor: z.string()
    .min(1, 'El piso es requerido')
    .max(10, 'El piso no puede exceder 10 caracteres')
    .optional(),
  tower: z.string()
    .min(1, 'La torre es requerida')
    .max(10, 'La torre no puede exceder 10 caracteres')
    .optional()
});

// Schema para query parameters de búsqueda
export const ApartmentQuerySchema = z.object({
  page: z.coerce.number().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.coerce.number().min(1, 'El límite debe ser mayor a 0').max(100, 'El límite no puede exceder 100').default(10),
  search: z.string().optional(),
  apartment: z.string().optional(),
  house: z.string().optional(),
  block: z.string().optional(),
  floor: z.string().optional(),
  tower: z.string().optional(),
  sortBy: z.enum(['apartment', 'house', 'block', 'floor', 'tower', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema para ID de apartamento
export const ApartmentIdSchema = z.object({
  id: z.coerce.number().min(1, 'El ID del apartamento debe ser un número válido mayor a 0')
});

// Schema para filtrar apartamentos
export const FilterApartmentsSchema = z.object({
  apartment: z.string().optional().nullable(),
  house: z.string().optional().nullable(),
  block: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  tower: z.string().optional().nullable(),
  fullAddress: z.string().optional().nullable()
});

// Schema para búsqueda de apartamentos por propietario
export const ApartmentByOwnerSchema = z.object({
  userId: z.string().min(1, 'El ID del usuario debe ser válido')
});

// Schema para validar apartamento único
export const UniqueApartmentSchema = z.object({
  apartment: z.string()
    .min(1, 'El número de apartamento es requerido')
    .max(10, 'El número de apartamento no puede exceder 10 caracteres'),
  house: z.string()
    .min(1, 'La casa o edificio es requerido')
    .max(50, 'La casa o edificio no puede exceder 50 caracteres'),
  block: z.string()
    .min(1, 'El bloque es requerido')
    .max(10, 'El bloque no puede exceder 10 caracteres'),
  floor: z.string()
    .min(1, 'El piso es requerido')
    .max(10, 'El piso no puede exceder 10 caracteres'),
  tower: z.string()
    .min(1, 'La torre es requerida')
    .max(10, 'La torre no puede exceder 10 caracteres')
});

// Tipos inferidos de los schemas
export type CreateApartmentDto = z.infer<typeof CreateApartmentSchema>;
export type UpdateApartmentDto = z.infer<typeof UpdateApartmentSchema>;
export type ApartmentQueryDto = z.infer<typeof ApartmentQuerySchema>;
export type ApartmentIdDto = z.infer<typeof ApartmentIdSchema>;
export type FilterApartmentsDto = z.infer<typeof FilterApartmentsSchema>;
export type ApartmentByOwnerDto = z.infer<typeof ApartmentByOwnerSchema>;
export type UniqueApartmentDto = z.infer<typeof UniqueApartmentSchema>;

/**
 * Schema para importación de apartamentos
 */
export const ApartmentImportSchema = z.object({
  apartment: z.string().min(1, 'El número de apartamento es requerido').max(10, 'El número de apartamento no puede exceder 10 caracteres'),
  house: z.string().min(1, 'El número de casa es requerido').max(50, 'El número de casa no puede exceder 50 caracteres'),
  fullAddress: z.string().min(1, 'La dirección completa es requerida').max(150, 'La dirección completa no puede exceder 150 caracteres'),
  block: z.string().min(1, 'El bloque es requerido').max(10, 'El bloque no puede exceder 10 caracteres'),
  floor: z.string().min(1, 'El piso es requerido').max(10, 'El piso no puede exceder 10 caracteres'),
  tower: z.string().min(1, 'La torre es requerida').max(10, 'La torre no puede exceder 10 caracteres')
});

export type ApartmentImportDto = z.infer<typeof ApartmentImportSchema>; 