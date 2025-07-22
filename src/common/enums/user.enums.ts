/**
 * Enums compartidos para el módulo de usuarios
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum UserSortField {
  USER_NAME = 'userName',
  FULL_NAME = 'fullName',
  EMAIL = 'email',
  ROLE = 'role',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  LAST_LOGIN = 'lastLogin'
} 