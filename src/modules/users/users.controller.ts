import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

import { UsersService } from './users.service';
import { CreateUserSchema, UpdateUserSchema, UserQuerySchema, UserIdSchema, FilterUsersSchema, FilterUsersForGroupSchema } from '../../common/dtos/inputs/user.input.dto';
import { CreateUserSwaggerDto } from '../../common/dtos/swagger/create-user.swagger.dto';
import { FirebaseAuthGuard } from '../../Auth/firebase-auth.guard';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  // Inyecta el servicio de usuarios para manejar la lógica de negocio
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea un nuevo usuario con los datos proporcionados en el cuerpo de la petición.
   * Valida la entrada usando Zod y documenta el endpoint con Swagger.
   * @param createUserDto Datos del usuario a crear
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Crear un nuevo usuario', description: 'Crea un usuario con los datos proporcionados.' })
  @ApiBody({ type: CreateUserSwaggerDto, description: 'Datos para crear el usuario', examples: {
    ejemplo: {
      value: {
        email: 'usuario@ejemplo.com',
        userName: 'usuario123',
        fullName: 'Usuario Ejemplo',
        role: 'user',
        phone: '123456789',
        address: 'Calle Falsa 123',
        birthDate: '1990-01-01',
        dni: '12345678',
        password: 'Password123!'
      }
    }
  }})
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: CreateUserSwaggerDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: z.infer<typeof CreateUserSchema>
  ) {
    // Llama al servicio para crear el usuario y retorna el resultado
    return this.usersService.createUser(createUserDto);
  }

  /**
   * Obtiene una lista paginada de usuarios.
   * Permite filtrar, buscar y ordenar los resultados mediante query params.
   * @param query Parámetros de consulta para paginación, búsqueda y filtrado
   */
  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Obtener todos los usuarios', description: 'Obtiene una lista paginada de usuarios con filtros opcionales.' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de usuarios por página', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre, email, etc.' })
  @ApiQuery({ name: 'role', required: false, description: 'Filtrar por rol', enum: ['admin', 'manager', 'user'] })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Campo para ordenar', enum: ['userName', 'fullName', 'email', 'role', 'createdAt', 'updatedAt', 'lastLogin'] })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Orden de clasificación', enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async findAll(
    @Query(new ZodValidationPipe(UserQuerySchema)) query: z.infer<typeof UserQuerySchema>
  ) {
    // Llama al servicio para obtener la lista de usuarios según los filtros
    return this.usersService.findAll(query);
  }

  /**
   * Obtiene los datos de un usuario específico por su ID.
   * @param params Objeto con el ID del usuario
   */
  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Obtener un usuario por ID', description: 'Obtiene los datos de un usuario específico por su ID.' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: CreateUserSwaggerDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(
    @Param(new ZodValidationPipe(UserIdSchema)) params: z.infer<typeof UserIdSchema>
  ) {
    // Llama al servicio para buscar el usuario por ID
    return this.usersService.findOne(params.id);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * Recibe el ID por parámetro de ruta y los datos a actualizar en el cuerpo.
   * @param params Objeto con el ID del usuario
   * @param updateUserDto Datos a actualizar
   */
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Actualizar un usuario', description: 'Actualiza los datos de un usuario existente.' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  @ApiBody({ type: CreateUserSwaggerDto, description: 'Datos a actualizar (parcial o total)' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: CreateUserSwaggerDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiProperty({ name: 'id', description: 'ID del usuario', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  async update(
    @Param(new ZodValidationPipe(UserIdSchema)) params: z.infer<typeof UserIdSchema>,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: z.infer<typeof UpdateUserSchema>
  ) {
    // Llama al servicio para actualizar el usuario y retorna el resultado
    return this.usersService.update(params.id, updateUserDto);
  }

  /**
   * Elimina un usuario por su ID.
   * @param params Objeto con el ID del usuario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Eliminar un usuario', description: 'Elimina un usuario por su ID.' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'ckl1q2w3e0000a1b2c3d4e5f6' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(
    @Param(new ZodValidationPipe(UserIdSchema)) params: z.infer<typeof UserIdSchema>
  ) {
    // Llama al servicio para eliminar el usuario
    return this.usersService.remove(params.id);
  }

  /**
   * Filtra usuarios por criterios específicos excluyendo los que ya están asignados al apartamento
   * @param filterDto Criterios de filtrado para los usuarios
   */
  @Post('filter')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ 
    summary: 'Filtrar usuarios', 
    description: 'Filtra usuarios por criterios específicos excluyendo los que ya están asignados al apartamento especificado.' 
  })
  @ApiBody({ 
    description: 'Criterios de filtrado para usuarios',
    examples: {
      ejemplo: {
        value: {
          apartmentId: 123,
          fullName: "Juan Pérez",
          dni: "12345678",
          email: "juan@email.com"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios filtrados',
    type: [CreateUserSwaggerDto]
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async filterUsers(
    @Body(new ZodValidationPipe(FilterUsersSchema)) filterDto: z.infer<typeof FilterUsersSchema>
  ) {
    // Llama al servicio para filtrar usuarios
    return this.usersService.filterUsers(filterDto);
  }

  /**
   * Filtra usuarios por criterios específicos para grupos, excluyendo los que ya están en el grupo
   * Incluye filtros por datos de usuario y datos de apartamento
   * @param filterDto Criterios de filtrado para los usuarios
   */
  @Post('filter-for-group')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ 
    summary: 'Filtrar usuarios para grupos', 
    description: 'Filtra usuarios por criterios específicos excluyendo los que ya están en el grupo. Incluye filtros por datos de usuario y datos de apartamento.' 
  })
  @ApiBody({ 
    description: 'Criterios de filtrado para usuarios en grupos',
    examples: {
      ejemplo: {
        value: {
          userGroupId: "group123",
          fullName: "Juan Pérez",
          dni: "12345678",
          email: "juan@email.com",
          apartment: "Apto 101",
          tower: "Torre A",
          floor: "Piso 1",
          block: "Bloque 1",
          house: "Casa 1"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios filtrados para grupos',
    type: [CreateUserSwaggerDto]
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async filterUsersForGroup(
    @Body(new ZodValidationPipe(FilterUsersForGroupSchema)) filterDto: z.infer<typeof FilterUsersForGroupSchema>
  ) {
    // Llama al servicio para filtrar usuarios para grupos
    return this.usersService.filterUsersForGroup(filterDto);
  }

  
}
