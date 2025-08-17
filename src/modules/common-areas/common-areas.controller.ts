import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonAreaIdSchema, CreateCommonAreaSchema, UpdateCommonAreaSchema } from 'src/common/dtos/inputs/commonArea.input.dto';
import { CommonAreasService } from './common-areas.service';
import { CreateCommonAreaDto } from './dto/create-common-area.dto';
import { UpdateCommonAreaDto } from './dto/update-common-area.dto';

@ApiTags('common-areas')
@Controller('common-areas')
export class CommonAreasController {
  constructor(private readonly commonAreasService: CommonAreasService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un área común' })
  @ApiBody({ type: CreateCommonAreaDto, description: 'Datos para crear el área común' })
  @ApiResponse({ status: 201, description: 'Área común creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El área común ya existe' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createCommonAreaDto: CreateCommonAreaDto): Promise<any> {
    try {
      const validatedData = CreateCommonAreaSchema.parse(createCommonAreaDto);
      return this.commonAreasService.create(validatedData);
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
  @ApiOperation({ summary: 'Obtener todos los áreas comúnes' })
  @ApiResponse({ status: 200, description: 'Lista de áreas comúnes' })
  @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
  findAll(@Query('search') search?: string): Promise<any> {
    if (search) {
      return this.commonAreasService.search(search);
    }
    return this.commonAreasService.findAll();

  }

  @Get('count')
  @ApiOperation({ summary: 'Obtener el total de áreas comúnes' })
  @ApiResponse({ status: 200, description: 'Total de áreas comúnes' })
  count() {
    return this.commonAreasService.count();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un área común por ID' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'ID único del área común',
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Área común encontrada' })
  @ApiResponse({ status: 404, description: 'Área común no encontrada' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  findOne(@Param() params: any): Promise<any> {
    try {
      const validatedParams = CommonAreaIdSchema.parse(params);
      return this.commonAreasService.findOne(validatedParams.id);
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
  @ApiOperation({ summary: 'Actualizar un área común' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'ID único del área común a actualizar',
    example: 1
  })
  @ApiBody({ 
    type: UpdateCommonAreaDto, 
    description: 'Datos para actualizar el área común'
  })
  @ApiResponse({ status: 200, description: 'Área común actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Área común no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  update(@Param('id') id: string, @Body() updateCommonAreaDto: UpdateCommonAreaDto) {
    try {
      const validatedData = UpdateCommonAreaSchema.parse(updateCommonAreaDto);
      return this.commonAreasService.update(+id, validatedData);
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

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un área común' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'ID único del área común a eliminar',
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Área común eliminada exitosamente', schema: { example: { message: 'Área común eliminada correctamente' } } })
  @ApiResponse({ status: 404, description: 'Área común no encontrada' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el área común porque tiene datos relacionados' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  remove(@Param() params: any): Promise<any> {
    try {
      const validatedParams = CommonAreaIdSchema.parse(params);
      return this.commonAreasService.remove(validatedParams.id);
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
