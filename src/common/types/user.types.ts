import { UserRole } from "../enums/user.enums";



export interface User {
  id: string;
  uid?: string; // Firebase UID (opcional para compatibilidad)
  userName: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  birthDate?: Date | string | null;
  dni: string;
  lastLogin?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  isEmailVerified: boolean;
  fcmTokens?: Array<{
    token: string;
    lastTokenUpdate: Date | string;
  }>;
}

export interface CreateUserResponse {
  userId: string;
  message: string;
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

export interface DeleteUserResponse {
  userId: string;
  message: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}