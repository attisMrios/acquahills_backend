import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateUserGroupDto } from '../../common/dtos/inputs/create-user-group.input.dto';
import { CreateUserGroupMembersBulkDto } from '../../common/dtos/inputs/create-user-group.input.dto';
import { UpdateUserGroupDto } from 'src/common/dtos/inputs/update-user-group.input.dto';

@Injectable()
export class UserGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Autor: dCardenas - Crear un nuevo grupo de usuarios */
  async create(createUserGroupDto: CreateUserGroupDto) {
    try {
      const userGroup = await this.prisma.userGroup.create({
        data: {
          name: createUserGroupDto.name,
          description: createUserGroupDto.description,
        },
      });

      return userGroup;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un grupo con este nombre');
      }
      throw error;
    }
  }

  /** Autor: dCardenas - Obtener todos los grupos */
  async findAll() {
    return this.prisma.userGroup.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                fullPhone: true,
                dni: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /** Autor: dCardenas - Obtener un grupo por ID */
  async findOne(id: string) {
    const userGroup = await this.prisma.userGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                dni: true,
              },
            },
          },
        },
      },
    });

    if (!userGroup) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }

    return userGroup;
  }

  /** Autor: dCardenas - Actualizar un grupo */
  async update(id: string, updateUserGroupDto: UpdateUserGroupDto) {
    try {
      const userGroup = await this.prisma.userGroup.update({
        where: { id },
        data: {
          name: updateUserGroupDto.name,
          description: updateUserGroupDto.description,
        },
      });

      return userGroup;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un grupo con este nombre');
      }
      throw error;
    }
  }

  /** Autor: dCardenas - Eliminar un grupo */
  async remove(id: string) {
    try {
      await this.prisma.userGroup.delete({
        where: { id },
      });
      return { message: 'Grupo eliminado correctamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  /** Autor: dCardenas - Agregar múltiples usuarios a un grupo */
  async addMembers(createUserGroupMembersBulkDto: CreateUserGroupMembersBulkDto) {
    try {
      const { userGroupId, userIds } = createUserGroupMembersBulkDto;
      const results: any[] = [];

      // Verificar que el grupo existe
      const userGroup = await this.prisma.userGroup.findUnique({
        where: { id: userGroupId },
      });

      if (!userGroup) {
        throw new NotFoundException(`Grupo con ID ${userGroupId} no encontrado`);
      }

      for (const userId of userIds) {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        try {
          const member = await this.prisma.userGroupMember.create({
            data: {
              userId: userId,
              userGroupId: userGroupId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  dni: true,
                },
              },
            },
          });
          results.push(member);
        } catch (error) {
          if (error.code === 'P2002') {
            // Si ya existe, lo omitimos y continuamos
            console.log(`La relación usuario-grupo ya existe para usuario ${userId} y grupo ${userGroupId}`);
            continue;
          }
          throw error;
        }
      }

      return {
        message: `${results.length} usuarios agregados al grupo exitosamente`,
        created: results,
        total: userIds.length,
        skipped: userIds.length - results.length
      };
    } catch (error) {
      throw error;
    }
  }

  /** Autor: dCardenas - Eliminar un usuario de un grupo */
  async removeMember(userGroupId: string, userId: string) {
    try {
      // Buscar la relación específica
      const member = await this.prisma.userGroupMember.findFirst({
        where: {
          userGroupId: userGroupId,
          userId: userId,
        },
      });

      if (!member) {
        throw new NotFoundException(`No se encontró la relación de usuario-grupo para el grupo ${userGroupId} y usuario ${userId}`);
      }

      // Eliminar la relación
      await this.prisma.userGroupMember.delete({
        where: { id: member.id },
      });

      return { message: 'Usuario eliminado del grupo correctamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`No se encontró la relación de usuario-grupo para el grupo ${userGroupId} y usuario ${userId}`);
      }
      throw error;
    }
  }
} 