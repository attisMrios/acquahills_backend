import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import {
  CreateApartmentDto as CreateApartmentInputDto,
  UpdateApartmentDto as UpdateApartmentInputDto,
} from '../../common/dtos/inputs/apartment.input.dto';

@Injectable()
export class ApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createApartmentDto: CreateApartmentDto | CreateApartmentInputDto) {
    try {
      const apartment = await this.prisma.apartment.create({
        data: createApartmentDto,
      });
      return apartment;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('El apartamento ya existe');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.apartment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: {
        propertyOwners: {
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
    });

    if (!apartment) {
      throw new NotFoundException(`Apartamento con ID ${id} no encontrado`);
    }

    return apartment;
  }

  async update(id: number, updateApartmentDto: UpdateApartmentDto | UpdateApartmentInputDto) {
    try {
      const apartment = await this.prisma.apartment.update({
        where: { id },
        data: updateApartmentDto,
      });
      return apartment;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Apartamento con ID ${id} no encontrado`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('El apartamento ya existe');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.apartment.delete({
        where: { id },
      });
      return { message: 'Apartamento eliminado correctamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Apartamento con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  async count() {
    return this.prisma.apartment.count();
  }

  async search(query: string) {
    return this.prisma.apartment.findMany({
      where: {
        OR: [
          { apartment: { contains: query, mode: 'insensitive' } },
          { house: { contains: query, mode: 'insensitive' } },
          { fullAddress: { contains: query, mode: 'insensitive' } },
          { block: { contains: query, mode: 'insensitive' } },
          { floor: { contains: query, mode: 'insensitive' } },
          { tower: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
