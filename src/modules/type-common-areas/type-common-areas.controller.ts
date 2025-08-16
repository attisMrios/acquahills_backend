import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    CreateTypeCommonAreaDto,
    CreateTypeCommonAreaSchema,
    TypeCommonAreaIdSchema,
    UpdateTypeCommonAreaDto,
    UpdateTypeCommonAreaSchema
} from 'src/common/dtos/inputs/typeCommonArea.input.dto';
import { CreateTypeCommonAreaSwaggerDto } from 'src/common/dtos/swagger/create-type-common-area.swagger.dto';
import { UpdateTypeCommonAreaSwaggerDto } from 'src/common/dtos/swagger/update-type-common-areas.swagger.dto';
import { TypeCommonAreasService } from './type-common-areas.service';

@ApiTags('type-common-areas')
@Controller('type-common-areas')
export class TypeCommonAreasController {
  constructor(private readonly typeCommonAreasService: TypeCommonAreasService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de área común' })
  @ApiBody({ type: CreateTypeCommonAreaSwaggerDto })
  @ApiResponse({ status: 201, description: 'Tipo de área común creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El tipo de área común ya existe' })
  create(@Body() createTypeCommonAreaDto: CreateTypeCommonAreaDto): Promise<any> {
    try {
      const validatedData = CreateTypeCommonAreaSchema.parse(createTypeCommonAreaDto);
      return this.typeCommonAreasService.create(validatedData);
    } catch (error) {
      if (error.errors) {
        throw new BadRequestException({
          message: 'Datos de entrada inválidos',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de áreas comúnes' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de áreas comúnes' })
  @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
  findAll(@Query('search') search?: string): Promise<any> {
    if (search) {
      return this.typeCommonAreasService.search(search);
    }
    return this.typeCommonAreasService.findAll({
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de área común por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de área común', type: 'number' })
  @ApiResponse({ status: 200, description: 'Tipo de área común encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de área común no encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  findOne(@Param() params: any): Promise<any> {
    try {
      const validatedParams = TypeCommonAreaIdSchema.parse(params);
      return this.typeCommonAreasService.findOne(validatedParams.id);
    } catch (error) {
      if (error.errors) {
        throw new BadRequestException({
          message: 'ID inválido',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de área común' })
  @ApiParam({ name: 'id', description: 'ID del tipo de área común', type: 'number' })
  @ApiBody({ type: UpdateTypeCommonAreaSwaggerDto })
  @ApiResponse({ status: 200, description: 'Tipo de área común actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tipo de área común no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El tipo de área común ya existe' })
  update(@Param('id') id: string, @Body() updateTypeCommonAreaDto: UpdateTypeCommonAreaDto) {
    try {
      console.log('🔍 [Controller] Recibiendo actualización:', { id, data: updateTypeCommonAreaDto });
      
      const validatedData = UpdateTypeCommonAreaSchema.parse(updateTypeCommonAreaDto);
      console.log('✅ [Controller] Datos validados:', validatedData);
      
      const result = this.typeCommonAreasService.update(+id, validatedData);
      console.log('🚀 [Controller] Enviando al servicio:', { id, validatedData });
      
      return result;
    } catch (error) {
      console.error('❌ [Controller] Error en validación:', error);
      
      if (error.errors) {
        throw new BadRequestException({
          message: 'Datos de entrada inválidos',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de área común' })
  @ApiParam({ name: 'id', description: 'ID del tipo de área común', type: 'number' })
  @ApiResponse({ status: 200, description: 'Tipo de área común eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tipo de área común no encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar porque está en uso' })
  remove(@Param() params: any): Promise<any> {
    try {
      const validatedParams = TypeCommonAreaIdSchema.parse(params);
      return this.typeCommonAreasService.remove(validatedParams.id);
    } catch (error) {
      if (error.errors) {
        throw new BadRequestException({
          message: 'ID inválido',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Verificar si un tipo de área común está en uso' })
  @ApiParam({ name: 'id', description: 'ID del tipo de área común', type: 'number' })
  @ApiResponse({ status: 200, description: 'Información de uso del tipo' })
  @ApiResponse({ status: 404, description: 'Tipo de área común no encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  checkUsage(@Param() params: any): Promise<any> {
    try {
      const validatedParams = TypeCommonAreaIdSchema.parse(params);
      return this.typeCommonAreasService.checkUsage(validatedParams.id);
    } catch (error) {
      if (error.errors) {
        throw new BadRequestException({
          message: 'ID inválido',
          errors: error.errors,
        });
      }
      throw error;
    }
  }
}