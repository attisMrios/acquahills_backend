import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

import { FirebaseAuthGuard } from '../../Auth/firebase-auth.guard';
import {
  CreateCommentSchema,
  CreateVehicleIncidentSchema,
  IncidentIdSchema,
  IncidentQuerySchema,
  UpdateIncidentSchema,
} from '../../common/dtos/inputs/incident.input.dto';
import {
  CreateIncidentResponseDto,
  IncidentListResponseDto,
  IncidentResponseDto,
} from '../../common/dtos/swagger/incident.response.dto';
import { IncidentsService } from './incidents.service';

@ApiTags('incidents')
@Controller('incidents')
@UseInterceptors(ClassSerializerInterceptor)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  /**
   * Crea un nuevo incidente de vehículo
   */
  @Post('vehicle')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({
    summary: 'Crear incidente de vehículo',
    description: 'Crea un nuevo incidente relacionado con un vehículo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['VEHICLE'], example: 'VEHICLE' },
        title: { type: 'string', example: 'Vehículo mal estacionado' },
        description: {
          type: 'string',
          example: 'El vehículo está estacionado en lugar prohibido y obstaculiza el paso',
        },
        status: {
          type: 'string',
          enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
          example: 'PENDING',
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          example: 'MEDIUM',
        },
        reportedBy: { type: 'string', example: 'ckl1q2w3e0000a1b2c3d4e5f6' },
        incidentData: {
          type: 'object',
          properties: {
            vehicleCode: { type: 'string', example: 'ABC123' },
            ownerId: { type: 'string', example: 'ckl1q2w3e0000a1b2c3d4e5f6' },
            brand: { type: 'string', example: 'Toyota' },
            model: { type: 'string', example: 'Corolla' },
            vehicleType: { type: 'string', example: 'CARRO' },
            color: { type: 'string', example: 'Blanco' },
          },
        },
      },
    },
    description: 'Datos para crear el incidente de vehículo',
  })
  @ApiResponse({
    status: 201,
    description: 'Incidente de vehículo creado exitosamente',
    type: CreateIncidentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createVehicleIncident(
    @Body(new ZodValidationPipe(CreateVehicleIncidentSchema))
    createDto: z.infer<typeof CreateVehicleIncidentSchema>,
  ) {
    return this.incidentsService.createVehicleIncident(createDto);
  }

  /**
   * Obtiene una lista paginada de incidentes
   */
  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({
    summary: 'Obtener todos los incidentes',
    description: 'Obtiene una lista paginada de incidentes con filtros opcionales.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de incidentes por página',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Búsqueda por título, descripción o datos del incidente',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filtrar por tipo',
    enum: ['VEHICLE', 'PET', 'COEXISTENCE', 'DAMAGE'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado',
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    description: 'Filtrar por prioridad',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  })
  @ApiQuery({ name: 'reportedBy', required: false, description: 'Filtrar por usuario que reportó' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo para ordenar',
    enum: ['createdAt', 'updatedAt', 'status', 'priority', 'type'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden de clasificación',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({ status: 200, description: 'Lista de incidentes', type: IncidentListResponseDto })
  async findAll(
    @Query(new ZodValidationPipe(IncidentQuerySchema)) query: z.infer<typeof IncidentQuerySchema>,
  ) {
    return this.incidentsService.findAll(query);
  }

  /**
   * Obtiene un incidente específico por ID
   */
  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({
    summary: 'Obtener incidente por ID',
    description: 'Obtiene los datos de un incidente específico por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID del incidente', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  @ApiResponse({ status: 200, description: 'Incidente encontrado', type: IncidentResponseDto })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado' })
  async findOne(
    @Param(new ZodValidationPipe(IncidentIdSchema)) params: z.infer<typeof IncidentIdSchema>,
  ) {
    return this.incidentsService.findOne(params.id);
  }

  /**
   * Actualiza un incidente
   */
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({
    summary: 'Actualizar incidente',
    description: 'Actualiza los datos de un incidente existente.',
  })
  @ApiParam({ name: 'id', description: 'ID del incidente', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Título actualizado' },
        description: { type: 'string', example: 'Descripción actualizada' },
        status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        incidentData: { type: 'object' },
      },
    },
    description: 'Datos para actualizar el incidente',
  })
  @ApiResponse({
    status: 200,
    description: 'Incidente actualizado exitosamente',
    type: IncidentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado' })
  async update(
    @Param(new ZodValidationPipe(IncidentIdSchema)) params: z.infer<typeof IncidentIdSchema>,
    @Body(new ZodValidationPipe(UpdateIncidentSchema))
    updateDto: z.infer<typeof UpdateIncidentSchema>,
  ) {
    return this.incidentsService.update(params.id, updateDto);
  }

  /**
   * Cambia el estado de un incidente
   */
  @Patch(':id/status')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({
    summary: 'Cambiar estado del incidente',
    description: 'Cambia el estado de un incidente existente.',
  })
  @ApiParam({ name: 'id', description: 'ID del incidente', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
          description: 'Nuevo estado del incidente',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del incidente actualizado exitosamente',
    type: IncidentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado' })
  async changeStatus(
    @Param(new ZodValidationPipe(IncidentIdSchema)) params: z.infer<typeof IncidentIdSchema>,
    @Body() body: { status: string },
  ) {
    return this.incidentsService.changeStatus(params.id, body.status as any);
  }

  /**
   * Elimina un incidente
   */
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({
    summary: 'Eliminar incidente',
    description: 'Elimina un incidente existente.',
  })
  @ApiParam({ name: 'id', description: 'ID del incidente', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  @ApiResponse({ status: 200, description: 'Incidente eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado' })
  async remove(
    @Param(new ZodValidationPipe(IncidentIdSchema)) params: z.infer<typeof IncidentIdSchema>,
  ) {
    return this.incidentsService.remove(params.id);
  }
}
