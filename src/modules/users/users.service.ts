import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, FilterUsersDto, FilterUsersForGroupDto } from '../../common/dtos/inputs/user.input.dto';
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
  ) {}

  /**
   * Crea un nuevo usuario
   */
  async createUser(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    let firebaseUser;
    try {
      // Validaciones previas en la base de datos
      const existingEmail = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
      if (existingEmail) throw new ConflictException('El correo electrónico ya está registrado');
      const existingUserName = await this.prisma.user.findUnique({ where: { userName: createUserDto.userName } });
      if (existingUserName) throw new ConflictException('El nombre de usuario ya está en uso');
      const existingDni = await this.prisma.user.findUnique({ where: { dni: createUserDto.dni } });
      if (existingDni) throw new ConflictException('El DNI ya está registrado');

      // 1. Crear en Firebase Auth primero
      try {
        firebaseUser = await this.firebaseService.getFirebaseAuth().createUser({
          email: createUserDto.email,
          password: createUserDto.password
        });
      } catch (firebaseError) {
        throw new ConflictException('El correo electrónico ya está registrado.');
      }

      // 2. Crear en la base de datos
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
      const userData = {
        ...createUserDto,
        password: hashedPassword,
        birthDate: createUserDto.birthDate ? new Date(createUserDto.birthDate) : null,
        isEmailVerified: false,
        fullPhone: createUserDto.fullPhone.replace(/^\+/, ''),
      };
      let user;
      try {
        user = await this.prisma.user.create({ data: userData });
      } catch (dbError) {
        // Si falla en la base de datos, elimina el usuario de Firebase Auth
        if (firebaseUser && firebaseUser.uid) {
          try {
            await this.firebaseService.getFirebaseAuth().deleteUser(firebaseUser.uid);
          } catch (cleanupError) {
            console.error('Error limpiando usuario huérfano en Firebase:', cleanupError);
          }
        }
        throw dbError;
      }

      // Claims, eventos, etc
      const customClaims = {
        role: createUserDto.role,
        canSendNotifications: createUserDto.role === UserRole.ADMIN || createUserDto.role === UserRole.MANAGER,
        createdAt: user.createdAt,
      };
      await this.firebaseService.getFirebaseAuth().setCustomUserClaims(firebaseUser.uid, customClaims);
      await this.firebaseService.getFirebaseAuth().generateEmailVerificationLink(createUserDto.email);
      await this.firebaseService.getFirebaseAuth().generatePasswordResetLink(createUserDto.email);
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
          isEmailVerified: true
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
        isEmailVerified: true
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
        isEmailVerified: true
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
        isEmailVerified: true
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
      if (updateUserDto.fullPhone) {
        updateData.fullPhone = updateUserDto.fullPhone.replace(/^\+/, '');
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
          isEmailVerified: true
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

  /**
   * Autor: dCardenas - Filtra usuarios por criterios específicos excluyendo los que ya están asignados al apartamento
   */
  async filterUsers(filterDto: FilterUsersDto): Promise<User[]> {
    try {
      console.log('FilterUsers - Input:', filterDto);
      
      // Validar que apartmentId existe
      if (!filterDto.apartmentId) {
        throw new BadRequestException('apartmentId es requerido');
      }
      
      // Obtener los IDs de usuarios que ya están asignados al apartamento
      const assignedUserIds = await this.prisma.propertyOwner.findMany({
        where: { apartmentId: filterDto.apartmentId },
        select: { userId: true }
      });

      console.log('Assigned user IDs:', assignedUserIds);

      const assignedIds = assignedUserIds.map(po => po.userId);

      // Construir filtros para la búsqueda
      const where: any = {};

      // Solo agregar notIn si hay usuarios asignados
      if (assignedIds.length > 0) {
        where.id = {
          notIn: assignedIds
        };
      }

      // Agregar filtros opcionales solo si tienen valor y no son null
      if (filterDto.fullName && filterDto.fullName.trim() !== '') {
        where.fullName = {
          contains: filterDto.fullName,
          mode: 'insensitive'
        };
      }

      if (filterDto.dni && filterDto.dni.trim() !== '') {
        where.dni = {
          contains: filterDto.dni,
          mode: 'insensitive'
        };
      }

      if (filterDto.email && filterDto.email.trim() !== '') {
        where.email = {
          contains: filterDto.email,
          mode: 'insensitive'
        };
      }

      console.log('Where clause:', JSON.stringify(where, null, 2));

      // Buscar usuarios que cumplan con los criterios
      const users = await this.prisma.user.findMany({
        where,
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
        },
        orderBy: {
          fullName: 'asc'
        }
      });
      return users as User[];
    } catch (error) {
      console.error('Error en filterUsers:', error);
      console.error('Error stack:', error.stack);
      throw new BadRequestException(`Error al filtrar usuarios: ${error.message}`);
    }
  }

  /**
   * Autor: dCardenas - Filtra usuarios por criterios específicos para grupos, excluyendo los que ya están en el grupo
   * Incluye filtros por datos de usuario y datos de apartamento
   */
  async filterUsersForGroup(filterDto: FilterUsersForGroupDto): Promise<User[]> {
    try {
      console.log('FilterUsersForGroup - Input:', filterDto);
      
      // Validar que userGroupId existe
      if (!filterDto.userGroupId) {
        throw new BadRequestException('userGroupId es requerido');
      }
      
      // Obtener los IDs de usuarios que ya están en el grupo
      const existingMemberIds = await this.prisma.userGroupMember.findMany({
        where: { userGroupId: filterDto.userGroupId },
        select: { userId: true }
      });

      console.log('Existing member IDs:', existingMemberIds);

      const existingIds = existingMemberIds.map(member => member.userId);

      // Construir filtros para la búsqueda de usuarios
      const where: any = {};

      // Solo agregar notIn si hay usuarios en el grupo
      if (existingIds.length > 0) {
        where.id = {
          notIn: existingIds
        };
      }

      // Agregar filtros de usuario
      if (filterDto.fullName && filterDto.fullName.trim() !== '') {
        where.fullName = {
          contains: filterDto.fullName,
          mode: 'insensitive'
        };
      }

      if (filterDto.dni && filterDto.dni.trim() !== '') {
        where.dni = {
          contains: filterDto.dni,
          mode: 'insensitive'
        };
      }

      if (filterDto.email && filterDto.email.trim() !== '') {
        where.email = {
          contains: filterDto.email,
          mode: 'insensitive'
        };
      }

      // Si hay filtros de apartamento, necesitamos hacer un join
      const hasApartmentFilters = filterDto.apartment || filterDto.tower || filterDto.floor || filterDto.block || filterDto.house;

      if (hasApartmentFilters) {
        // Buscar usuarios que sean propietarios de apartamentos que cumplan los criterios
        const apartmentWhere: any = {};
        
        if (filterDto.apartment) {
          apartmentWhere.apartment = {
            contains: filterDto.apartment,
            mode: 'insensitive'
          };
        }
        
        if (filterDto.tower) {
          apartmentWhere.tower = {
            contains: filterDto.tower,
            mode: 'insensitive'
          };
        }
        
        if (filterDto.floor) {
          apartmentWhere.floor = {
            contains: filterDto.floor,
            mode: 'insensitive'
          };
        }
        
        if (filterDto.block) {
          apartmentWhere.block = {
            contains: filterDto.block,
            mode: 'insensitive'
          };
        }
        
        if (filterDto.house) {
          apartmentWhere.house = {
            contains: filterDto.house,
            mode: 'insensitive'
          };
        }

        // Buscar usuarios que sean propietarios de apartamentos que cumplan los criterios
        const usersWithApartments = await this.prisma.propertyOwner.findMany({
          where: {
            apartment: apartmentWhere
          },
          select: {
            userId: true
          },
          distinct: ['userId'] // Evitar duplicados
        });

        const userIdsFromApartments = usersWithApartments.map(po => po.userId);
        
        // Agregar el filtro de usuarios que sean propietarios de estos apartamentos
        if (userIdsFromApartments.length > 0) {
          where.id = {
            ...where.id,
            in: userIdsFromApartments
          };
        } else {
          // Si no hay apartamentos que cumplan los criterios, no hay usuarios
          return [];
        }
      }

      console.log('Where clause:', JSON.stringify(where, null, 2));

      // Buscar usuarios que cumplan con los criterios
      const users = await this.prisma.user.findMany({
        where,
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
        },
        orderBy: {
          fullName: 'asc'
        }
      });
      return users as User[];
    } catch (error) {
      console.error('Error en filterUsersForGroup:', error);
      console.error('Error stack:', error.stack);
      throw new BadRequestException(`Error al filtrar usuarios para grupo: ${error.message}`);
    }
  }
} 