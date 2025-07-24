import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../../common/dtos/inputs/user.input.dto';
import { User, CreateUserResponse, UpdateUserResponse, DeleteUserResponse, UsersResponse } from '../../common/types/user.types';
import * as bcrypt from 'bcryptjs';
import { FirebaseService } from 'src/common/services/firebase.service';
import { UserRole } from 'src/common/enums/user.enums';
import { UpdatesService } from '../updates/updates.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly updatesService: UpdatesService
  ) { }

  /**
   * Crea un nuevo usuario
   */
  async createUser(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    try {

      /**
       * Verificar si el email ya existe
       */
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: createUserDto.email }
      });

      if (existingEmail) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      //--------------------------------

      /**
       * Verificar si el userName ya existe
       */
      const existingUserName = await this.prisma.user.findUnique({
        where: { userName: createUserDto.userName }
      });

      if (existingUserName) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
      //--------------------------------

      /**
       * Verificar si el DNI ya existe
       */
      const existingDni = await this.prisma.user.findUnique({
        where: { dni: createUserDto.dni }
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }

      /**
       * Encriptar la contraseña
       */
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      /**
       * Crear el usuario
       */
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          birthDate: createUserDto.birthDate ? new Date(createUserDto.birthDate) : null,
          isEmailVerified: false
        }
      });

      /**
       * Crear el usuario en Firebase Auth
       */
      const firebaseUser = await this.firebaseService.getFirebaseAuth().createUser({
        email: createUserDto.email,
        password: createUserDto.password
      });


      /**
       * Asigna los climbs en Firebase Auth
      */
      const customClaims = {
        role: createUserDto.role,
        canSendNotifications: createUserDto.role === UserRole.ADMIN || createUserDto.role === UserRole.MANAGER,
        createdAt: user.createdAt,
      };
      await this.firebaseService.getFirebaseAuth().setCustomUserClaims(firebaseUser.uid, customClaims);

      // Emitir evento SSE
      this.updatesService.emitUserEvent('created', user);

      return {
        userId: user.id,
        message: 'Usuario creado exitosamente'
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  /**
   * Obtiene todos los usuarios con paginación y filtros
   */
  async findAll(query: UserQueryDto): Promise<UsersResponse> {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    // Obtener usuarios
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          userName: true,
          fullName: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          birthDate: true,
          dni: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          isEmailVerified: true,
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      users: users as User[],
      total,
      page,
      limit
    };
  }

  /**
   * Obtiene un usuario por ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userName: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        birthDate: true,
        dni: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        isEmailVerified: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user as User;
  }

  /**
   * Obtiene un usuario por DNI
   */
  async findByDni(dni: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { dni },
      select: {
        id: true,
        userName: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        birthDate: true,
        dni: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        isEmailVerified: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user as User;
  }

  /**
   * Obtiene un usuario por email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        userName: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        birthDate: true,
        dni: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        isEmailVerified: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user as User;
  }

  /**
   * Actualiza un usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UpdateUserResponse> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar conflictos si se están actualizando campos únicos
      if (updateUserDto.userName && updateUserDto.userName !== existingUser.userName) {
        const existingUserName = await this.prisma.user.findUnique({
          where: { userName: updateUserDto.userName }
        });

        if (existingUserName) {
          throw new ConflictException('El nombre de usuario ya está en uso');
        }
      }

      if (updateUserDto.dni && updateUserDto.dni !== existingUser.dni) {
        const existingDni = await this.prisma.user.findUnique({
          where: { dni: updateUserDto.dni }
        });

        if (existingDni) {
          throw new ConflictException('El DNI ya está registrado');
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateUserDto };

      if (updateUserDto.birthDate) {
        updateData.birthDate = new Date(updateUserDto.birthDate);
      }

      // Actualizar usuario
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          userName: true,
          fullName: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          birthDate: true,
          dni: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          isEmailVerified: true,
        }
      });

      // Emitir evento SSE
      this.updatesService.emitUserEvent('updated', user);

      return {
        user: user as User,
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  /**
   * Elimina un usuario
   */
  async remove(id: string): Promise<DeleteUserResponse> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Eliminar usuario (esto también eliminará los FCM tokens por la relación cascade)
      await this.prisma.user.delete({
        where: { id }
      });

      // Emitir evento SSE
      this.updatesService.emitUserEvent('deleted', { id });

      return {
        userId: id,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el usuario');
    }
  }

  /**
   * Actualiza el último login del usuario
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() }
    });
  }

  /**
   * Verifica si un email existe
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user;
  }

  /**
   * Verifica si un userName existe
   */
  async userNameExists(userName: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { userName },
      select: { id: true }
    });
    return !!user;
  }

  /**
   * Verifica si un DNI existe
   */
  async dniExists(dni: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { dni },
      select: { id: true }
    });
    return !!user;
  }
} 