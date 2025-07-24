import { z } from 'zod';
import { UserRole } from '../../enums/user.enums';

/**
 * DTOs con validación Zod para el módulo de usuarios
 */

// Schema para crear usuario
export const CreateUserSchema = z.object({
  email: z.string().email('El correo electrónico no es válido'),
  userName: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  fullName: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres').max(100, 'El nombre completo no puede exceder 100 caracteres'),
  role: z.nativeEnum(UserRole, {
    message: 'El rol debe ser admin, manager o user'
  }),
  countryCode: z.string().min(2, 'El código de país es requerido').max(3, 'El código de país no puede exceder 3 caracteres'),
  phone: z.string().min(5, 'El número local es requerido').max(20, 'El número local no puede exceder 20 dígitos').regex(/^\d+$/, 'El número local solo debe contener dígitos'),
  fullPhone: z.string().min(8, 'El número internacional es requerido').max(20, 'El número internacional no puede exceder 20 dígitos').regex(/^\d+$/, 'El número internacional solo debe contener dígitos (sin +)'),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  dni: z.string().min(8, 'El DNI debe tener al menos 8 caracteres').max(20, 'El DNI no puede exceder 20 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
  )
});

// Schema para actualizar usuario
export const UpdateUserSchema = z.object({
  userName: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(50, 'El nombre de usuario no puede exceder 50 caracteres').optional(),
  fullName: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres').max(100, 'El nombre completo no puede exceder 100 caracteres').optional(),
  role: z.nativeEnum(UserRole, {
    message: 'El rol debe ser admin, manager o user'
  }).optional(),
  countryCode: z.string().min(2).max(3).optional(),
  phone: z.string().min(5).max(20).regex(/^\d+$/, 'El número local solo debe contener dígitos').optional(),
  fullPhone: z.string().min(8).max(20).regex(/^\d+$/, 'El número internacional solo debe contener dígitos (sin +)').optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  dni: z.string().min(8, 'El DNI debe tener al menos 8 caracteres').max(20, 'El DNI no puede exceder 20 caracteres').optional(),
  isEmailVerified: z.boolean().optional()
});

// Schema para query parameters de búsqueda
export const UserQuerySchema = z.object({
  page: z.coerce.number().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.coerce.number().min(1, 'El límite debe ser mayor a 0').max(100, 'El límite no puede exceder 100').default(10),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  sortBy: z.enum(['userName', 'fullName', 'email', 'role', 'createdAt', 'updatedAt', 'lastLogin']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema para ID de usuario
export const UserIdSchema = z.object({
  id: z.string().min(1, 'El ID del usuario no es válido')
});

// Schema para DNI
export const UserDniSchema = z.object({
  dni: z.string().min(8, 'El DNI debe tener al menos 8 caracteres').max(20, 'El DNI no puede exceder 20 caracteres')
});

// Schema para email
export const UserEmailSchema = z.object({
  email: z.string().email('El correo electrónico no es válido')
});

// Tipos inferidos de los schemas
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserQueryDto = z.infer<typeof UserQuerySchema>;
export type UserIdDto = z.infer<typeof UserIdSchema>;
export type UserDniDto = z.infer<typeof UserDniSchema>;
export type UserEmailDto = z.infer<typeof UserEmailSchema>; 