import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreatePropertyOwnerDto, CreatePropertyOwnersBulkDto } from './dto/create-property-owner.dto';
import { UpdatePropertyOwnerDto } from './dto/update-property-owner.dto';

@Injectable()
export class PropertyOwnersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Autor: dCardenas - Crear una nueva relación de propietario de apartamento */
  async create(createPropertyOwnerDto: CreatePropertyOwnerDto) {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: createPropertyOwnerDto.userId },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${createPropertyOwnerDto.userId} no encontrado`);
      }

      // Verificar que el apartamento existe
      const apartment = await this.prisma.apartment.findUnique({
        where: { id: createPropertyOwnerDto.apartmentId },
      });

      if (!apartment) {
        throw new NotFoundException(`Apartamento con ID ${createPropertyOwnerDto.apartmentId} no encontrado`);
      }

      const propertyOwner = await this.prisma.propertyOwner.create({
        data: {
          userId: createPropertyOwnerDto.userId,
          apartmentId: createPropertyOwnerDto.apartmentId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          apartment: true,
        },
      });

      return propertyOwner;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Esta relación de propietario ya existe');
      }
      throw error;
    }
  }

  /** Autor: dCardenas - Crear múltiples relaciones de propietarios de apartamento */
  async createMany(createPropertyOwnersListDto: CreatePropertyOwnersBulkDto) {
    try {
      const { apartmentId, userIds } = createPropertyOwnersListDto;
      const results: any[] = [];

      for (const userId of userIds) {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        // Verificar que el apartamento existe
        const apartment = await this.prisma.apartment.findUnique({
          where: { id: apartmentId },
        });

        if (!apartment) {
          throw new NotFoundException(`Apartamento con ID ${apartmentId} no encontrado`);
        }

        try {
          const propertyOwner = await this.prisma.propertyOwner.create({
            data: {
              userId: userId,
              apartmentId: apartmentId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
              apartment: true,
            },
          });
          results.push(propertyOwner);
        } catch (error) {
          if (error.code === 'P2002') {
            // Si ya existe, lo omitimos y continuamos
            console.log(`La relación propietario-apartamento ya existe para usuario ${userId} y apartamento ${apartmentId}`);
            continue;
          }
          throw error;
        }
      }

      return {
        message: `${results.length} propietarios agregados exitosamente`,
        created: results,
        total: userIds.length,
        skipped: userIds.length - results.length
      };
    } catch (error) {
      throw error;
    }
  }

  /** Autor: dCardenas - Actualizar una relación de propietario */
  async update(id: string, updatePropertyOwnerDto: UpdatePropertyOwnerDto) {
    try {
      // Verificar que la relación existe
      const existingPropertyOwner = await this.prisma.propertyOwner.findUnique({
        where: { id },
      });

      if (!existingPropertyOwner) {
        throw new NotFoundException(`Propietario con ID ${id} no encontrado`);
      }

      // Verificar que el usuario existe si se está actualizando
      if (updatePropertyOwnerDto.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: updatePropertyOwnerDto.userId },
        });

        if (!user) {
          throw new NotFoundException(`Usuario con ID ${updatePropertyOwnerDto.userId} no encontrado`);
        }
      }

      // Verificar que el apartamento existe si se está actualizando
      if (updatePropertyOwnerDto.apartmentId) {
        const apartment = await this.prisma.apartment.findUnique({
          where: { id: updatePropertyOwnerDto.apartmentId },
        });

        if (!apartment) {
          throw new NotFoundException(`Apartamento con ID ${updatePropertyOwnerDto.apartmentId} no encontrado`);
        }
      }

      const updateData: any = {};
      if (updatePropertyOwnerDto.userId) updateData.userId = updatePropertyOwnerDto.userId;
      if (updatePropertyOwnerDto.apartmentId) updateData.apartmentId = updatePropertyOwnerDto.apartmentId;

      const propertyOwner = await this.prisma.propertyOwner.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          apartment: true,
        },
      });

      return propertyOwner;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Propietario con ID ${id} no encontrado`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Esta relación de propietario ya existe');
      }
      throw error;
    }
  }

  /** Autor: dCardenas - Eliminar una relación de propietario */
  async remove(id: string) {
    try {
      await this.prisma.propertyOwner.delete({
        where: { id },
      });
      return { message: 'Propietario eliminado correctamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Propietario con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  /** Autor: dCardenas - Eliminar una relación de propietario por apartmentId y userId */
  async removeByApartmentAndUser(apartmentId: number, userId: string) {
    try {
      // Buscar la relación específica
      const propertyOwner = await this.prisma.propertyOwner.findFirst({
        where: {
          apartmentId: apartmentId,
          userId: userId,
        },
      });

      if (!propertyOwner) {
        throw new NotFoundException(`No se encontró la relación de propietario para el apartamento ${apartmentId} y usuario ${userId}`);
      }

      // Eliminar la relación
      await this.prisma.propertyOwner.delete({
        where: { id: propertyOwner.id },
      });

      return { message: 'Propietario eliminado correctamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`No se encontró la relación de propietario para el apartamento ${apartmentId} y usuario ${userId}`);
      }
      throw error;
    }
  }
} 