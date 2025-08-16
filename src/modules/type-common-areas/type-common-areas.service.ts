import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
    CreateTypeCommonAreaDto as CreateTypeCommonAreaInputDto,
    TypeCommonAreaQueryDto,
    UpdateTypeCommonAreaDto as UpdateTypeCommonAreaInputDto
} from 'src/common/dtos/inputs/typeCommonArea.input.dto';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class TypeCommonAreasService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTypeCommonAreaDto: CreateTypeCommonAreaInputDto) {
    try {
      const typeCommonArea = await this.prisma.typeCommonArea.create({
        data: createTypeCommonAreaDto,
      });
      return typeCommonArea;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('El tipo de área común ya existe');
      }
      throw error;
    }
  }

  async findAll(query: TypeCommonAreaQueryDto) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.TypeCommonAreaWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const typeCommonAreas = await this.prisma.typeCommonArea.findMany({
      skip,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder },
    });
    return typeCommonAreas;
  }

  async findOne(id: number) {
    const typeCommonArea = await this.prisma.typeCommonArea.findUnique({
      where: { id },
    });
    if (!typeCommonArea) {
      throw new NotFoundException(`El tipo de área común con ID ${id} no encontrado`);
    }
    return typeCommonArea;
  }

  async update(id: number, updateTypeCommonAreaDto: UpdateTypeCommonAreaInputDto) {
    try {
      const typeCommonArea = await this.prisma.typeCommonArea.update({
        where: { id },
        data: updateTypeCommonAreaDto,
      });
      return typeCommonArea;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`El tipo de área común con ID ${id} no encontrado`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('El tipo de área común ya existe');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Verificar si el tipo está siendo usado por áreas comunes
      const areasUsingType = await this.prisma.commonArea.findMany({
        where: { typeCommonAreaId: id },
        select: {
          id: true,
          name: true,
          description: true
        }
      });

      if (areasUsingType.length > 0) {
        const areaNames = areasUsingType.map(area => area.name).join(', ');
        throw new ConflictException(
          `No se puede eliminar este tipo de área común porque está siendo utilizado por ${areasUsingType.length} área(s) común(es): ${areaNames}`
        );
      }

      await this.prisma.typeCommonArea.delete({
        where: { id },
      });
      return { message: 'Tipo de área común eliminado correctamente' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-lanzar el error de conflicto personalizado
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`El tipo de área común con ID ${id} no encontrado`);
      }
      if (error.code === 'P2003') {
        // Fallback para restricción de clave foránea (aunque ya lo manejamos arriba)
        throw new ConflictException(
          'No se puede eliminar este tipo de área común porque está siendo utilizado por una o más áreas comunes'
        );
      }
      throw error;
    }
  }

  async search(query: string) {
    return this.prisma.typeCommonArea.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Verifica si un tipo de área común está siendo utilizado por áreas comunes
   * @param id - ID del tipo de área común
   * @returns Información sobre el uso del tipo
   */
  async checkUsage(id: number) {
    const areasUsingType = await this.prisma.commonArea.findMany({
      where: { typeCommonAreaId: id },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    return {
      isUsed: areasUsingType.length > 0,
      usageCount: areasUsingType.length,
      areas: areasUsingType
    };
  }
}
