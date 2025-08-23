import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateCommentDto,
    CreateVehicleIncidentDto,
    IncidentQueryDto,
    IncidentStatus,
    UpdateIncidentDto
} from '../../common/dtos/inputs/incident.input.dto';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo incidente de vehículo
   */
  async createVehicleIncident(createDto: CreateVehicleIncidentDto) {
    try {
      // Crear el incidente con datos JSON flexibles
      const incident = await this.prisma.incident.create({
        data: {
          type: createDto.type,
          title: createDto.title,
          description: createDto.description,
          status: createDto.status,
          priority: createDto.priority,
          reportedBy: createDto.reportedBy,
          incidentData: createDto.incidentData,
        },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Incidente de vehículo creado exitosamente',
        data: {
          id: incident.id,
          incident: incident,
        },
      };
    } catch (error) {
      console.error('Error al crear incidente de vehículo:', error);
      throw new BadRequestException('Error al crear el incidente');
    }
  }

  /**
   * Obtiene todos los incidentes con paginación y filtros
   */
  async findAll(query: IncidentQueryDto) {
    const { page, limit, search, type, status, priority, reportedBy, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { incidentData: { path: ['vehicleCode'], string_contains: search } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (reportedBy) where.reportedBy = reportedBy;

    // Obtener total de registros
    const total = await this.prisma.incident.count({ where });

    // Obtener incidentes con paginación
    const incidents = await this.prisma.incident.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: incidents,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Obtiene un incidente por ID
   */
  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException('Incidente no encontrado');
    }

    return incident;
  }

  /**
   * Actualiza un incidente
   */
  async update(id: string, updateDto: UpdateIncidentDto) {
    // Verificar que el incidente existe
    const existingIncident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      throw new NotFoundException('Incidente no encontrado');
    }

    // Actualizar el incidente
    const updatedIncident = await this.prisma.incident.update({
      where: { id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Incidente actualizado exitosamente',
      data: updatedIncident,
    };
  }

  /**
   * Cambia el estado de un incidente
   */
  async changeStatus(id: string, status: IncidentStatus) {
    // Verificar que el incidente existe
    const existingIncident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      throw new NotFoundException('Incidente no encontrado');
    }

    // Actualizar el estado
    const updatedIncident = await this.prisma.incident.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Estado del incidente actualizado exitosamente',
      data: updatedIncident,
    };
  }

  /**
   * Agrega un comentario a un incidente
   */
  async addComment(incidentId: string, userId: string, commentDto: CreateCommentDto) {
    // Verificar que el incidente existe
    const existingIncident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!existingIncident) {
      throw new NotFoundException('Incidente no encontrado');
    }

    // Crear el comentario
    const newComment = await this.prisma.incidentComment.create({
      data: {
        incidentId,
        userId,
        comment: commentDto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            fullName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Comentario agregado exitosamente',
      data: newComment,
    };
  }

  /**
   * Elimina un incidente
   */
  async remove(id: string) {
    // Verificar que el incidente existe
    const existingIncident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      throw new NotFoundException('Incidente no encontrado');
    }

    // Eliminar el incidente (esto también eliminará las relaciones por CASCADE)
    await this.prisma.incident.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Incidente eliminado exitosamente',
    };
  }
}
