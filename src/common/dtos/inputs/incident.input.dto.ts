import { z } from 'zod';

/**
 * DTOs con validación Zod para el módulo de incidentes
 */

// Enums para incidentes
export enum IncidentType {
  VEHICLE = 'VEHICLE',
  PET = 'PET',
  COEXISTENCE = 'COEXISTENCE',
  DAMAGE = 'DAMAGE',
}

export enum IncidentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export enum IncidentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Schema para crear incidente (genérico)
export const CreateIncidentSchema = z.object({
  type: z.nativeEnum(IncidentType, {
    invalid_type_error: 'El tipo de incidente debe ser VEHICLE, PET, COEXISTENCE o DAMAGE',
  }),
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  status: z.nativeEnum(IncidentStatus).default(IncidentStatus.PENDING),
  priority: z.nativeEnum(IncidentPriority).default(IncidentPriority.MEDIUM),
  reportedBy: z.string().min(1, 'El ID del usuario que reporta es requerido'),
  incidentData: z.record(z.any()).optional(), // Datos específicos del tipo de incidente
});

// Schema específico para incidente de vehículo
export const CreateVehicleIncidentSchema = CreateIncidentSchema.extend({
  type: z.literal(IncidentType.VEHICLE),
  incidentData: z.object({
    vehicleCode: z.string().min(1, 'El código del vehículo es requerido'),
    ownerId: z.string().min(1, 'El ID del propietario es requerido'),
    brand: z.string().min(1, 'La marca del vehículo es requerida'),
    model: z.string().min(1, 'El modelo del vehículo es requerido'),
    vehicleType: z.string().min(1, 'El tipo de vehículo es requerido'),
    color: z.string().min(1, 'El color del vehículo es requerido'),
  }),
});

// Schema específico para incidente de mascota
export const CreatePetIncidentSchema = CreateIncidentSchema.extend({
  type: z.literal(IncidentType.PET),
  incidentData: z.object({
    petType: z.string().min(1, 'El tipo de mascota es requerido'),
  }),
});

// Schema específico para incidente de convivencia
export const CreateCoexistenceIncidentSchema = CreateIncidentSchema.extend({
  type: z.literal(IncidentType.COEXISTENCE),
  incidentData: z.object({
    issueType: z.string().min(1, 'El tipo de problema es requerido'),
  }),
});

// Schema específico para incidente de daños
export const CreateDamageIncidentSchema = CreateIncidentSchema.extend({
  type: z.literal(IncidentType.DAMAGE),
  incidentData: z.object({
    damageType: z.string().min(1, 'El tipo de daño es requerido'),
    location: z.string().min(1, 'La ubicación del daño es requerida'),
  }),
});

// Schema para actualizar incidente
export const UpdateIncidentSchema = z.object({
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .optional(),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  incidentData: z.record(z.any()).optional(),
});

// Schema para query parameters de búsqueda
export const IncidentQuerySchema = z.object({
  page: z.coerce.number().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.coerce
    .number()
    .min(1, 'El límite debe ser mayor a 0')
    .max(100, 'El límite no puede exceder 100')
    .default(10),
  search: z.string().optional(),
  type: z.nativeEnum(IncidentType).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  reportedBy: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'priority', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema para ID de incidente
export const IncidentIdSchema = z.object({
  id: z.string().min(1, 'El ID del incidente no es válido'),
});

// Schema para comentarios
export const CreateCommentSchema = z.object({
  comment: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(500, 'El comentario no puede exceder 500 caracteres'),
});

// Tipos inferidos de los schemas
export type CreateIncidentDto = z.infer<typeof CreateIncidentSchema>;
export type CreateVehicleIncidentDto = z.infer<typeof CreateVehicleIncidentSchema>;
export type CreatePetIncidentDto = z.infer<typeof CreatePetIncidentSchema>;
export type CreateCoexistenceIncidentDto = z.infer<typeof CreateCoexistenceIncidentSchema>;
export type CreateDamageIncidentDto = z.infer<typeof CreateDamageIncidentSchema>;
export type UpdateIncidentDto = z.infer<typeof UpdateIncidentSchema>;
export type IncidentQueryDto = z.infer<typeof IncidentQuerySchema>;
export type IncidentIdDto = z.infer<typeof IncidentIdSchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
