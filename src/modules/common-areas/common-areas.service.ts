import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommonAreaDto as CreateCommonAreaInputDto, UpdateCommonAreaDto as UpdateCommonAreaInputDto } from 'src/common/dtos/inputs/commonArea.input.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateCommonAreaDto } from './dto/create-common-area.dto';
import { UpdateCommonAreaDto } from './dto/update-common-area.dto';

@Injectable()
export class CommonAreasService {
  [x: string]: any;
  constructor(private readonly prisma: PrismaService) {}
  
  async create(createCommonAreaDto: CreateCommonAreaDto | CreateCommonAreaInputDto) {
    try {
      const { unavailableDays, timeSlots, ...rest } = createCommonAreaDto as any;

      const commonArea = await this.prisma.commonArea.create({
        data: {
          ...rest,
          unavailableDays: unavailableDays && unavailableDays.length > 0
            ? {
                create: unavailableDays.map((day: any) => ({
                  weekDay: day.weekDay,
                  isFirstWorkingDay: day.isFirstWorkingDay,
                })),
              }
            : undefined,
          timeSlots: timeSlots && timeSlots.length > 0
            ? {
                create: timeSlots.map((slot: any) => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })),
              }
            : undefined,
        },
        include: {
          unavailableDays: true,
          timeSlots: true,
        },
      });
      return commonArea;
    } catch (error) {
      console.error('Error creating common area:', error);
      if (error.code === 'P2002') {
        throw new ConflictException('El área común ya existe');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.commonArea.findMany({
      include: {
        unavailableDays: true,
        timeSlots: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const commonArea = await this.prisma.commonArea.findUnique({
      where: { id },
      include: {
        unavailableDays: true,
        timeSlots: true,
      },
    });

    if (!commonArea) {
      throw new NotFoundException(`Área común con ID ${id} no encontrada`);
    }

    return commonArea;
  }

  async update(id: number, updateCommonAreaDto: UpdateCommonAreaDto | UpdateCommonAreaInputDto) {
    try {
      // Adaptar el DTO para cumplir con la estructura esperada por Prisma
      const { unavailableDays, timeSlots, ...rest } = updateCommonAreaDto as any;

      const data: any = {
        ...rest,
        ...(unavailableDays && Array.isArray(unavailableDays)
          ? {
              unavailableDays: {
                deleteMany: {}, // Elimina todos los días no disponibles actuales
                create: unavailableDays.map((day: any) => ({
                  weekDay: day.weekDay,
                  isFirstWorkingDay: day.isFirstWorkingDay,
                })),
              },
            }
          : {}),
        ...(timeSlots && Array.isArray(timeSlots)
          ? {
              timeSlots: {
                deleteMany: {}, // Elimina todos los horarios actuales
                create: timeSlots.map((slot: any) => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })),
              },
            }
          : {}),
      };

      const commonArea = await this.prisma.commonArea.update({
        where: { id },
        data,
        include: {
          unavailableDays: true,
          timeSlots: true,
        },
      });
      return commonArea;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Área común con ID ${id} no encontrada`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('El área común ya existe');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Verificar que el área común existe
      const existingArea = await this.prisma.commonArea.findUnique({
        where: { id },
        include: {
          unavailableDays: true,
          timeSlots: true,
        },
      });

      if (!existingArea) {
        throw new NotFoundException(`Área común con ID ${id} no encontrada`);
      }

      console.log(`Eliminando área común ID: ${id}`);
      console.log(`Días no disponibles encontrados: ${existingArea.unavailableDays.length}`);
      console.log(`Horarios encontrados: ${existingArea.timeSlots.length}`);

      // Verificar registros específicos antes de eliminar
      const timeSlotsBeforeDelete = await this.prisma.commonAreaTimeSlot.findMany({
        where: { commonAreaId: id },
      });
      console.log(`TimeSlots antes de eliminar:`, timeSlotsBeforeDelete);

      // Usar transacción para asegurar consistencia
      const result = await this.prisma.$transaction(async (prisma) => {
        // Eliminar días no disponibles
        const deletedUnavailableDays = await prisma.commonAreaUnavailableDay.deleteMany({
          where: { commonAreaId: id },
        });
        console.log(`Días no disponibles eliminados: ${deletedUnavailableDays.count}`);

        // Eliminar horarios
        const deletedTimeSlots = await prisma.commonAreaTimeSlot.deleteMany({
          where: { commonAreaId: id },
        });
        console.log(`Horarios eliminados: ${deletedTimeSlots.count}`);

        // Verificar que se eliminaron
        const remainingTimeSlots = await prisma.commonAreaTimeSlot.findMany({
          where: { commonAreaId: id },
        });
        console.log(`TimeSlots restantes después de eliminar:`, remainingTimeSlots);

        // Eliminar el área común
        const deletedArea = await prisma.commonArea.delete({
          where: { id },
        });
        console.log(`Área común eliminada: ${deletedArea.id}`);

        return {
          deletedUnavailableDays: deletedUnavailableDays.count,
          deletedTimeSlots: deletedTimeSlots.count,
          deletedArea: deletedArea.id
        };
      });

      console.log('Eliminación completada exitosamente:', result);
      return { 
        message: 'Área común eliminada correctamente',
        details: {
          unavailableDaysDeleted: result.deletedUnavailableDays,
          timeSlotsDeleted: result.deletedTimeSlots
        }
      };
    } catch (error) {
      console.error('Error deleting common area:', error);
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`Área común con ID ${id} no encontrada`);
      }
      if (error.code === 'P2003') {
        throw new ConflictException('No se puede eliminar el área común porque tiene datos relacionados');
      }
      throw error;
    }
  }

  async count() {
    return this.prisma.commonArea.count();
  }

  async search(query: string) {
    return this.prisma.commonArea.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
         ],
      },
      include: {
        unavailableDays: true,
        timeSlots: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

