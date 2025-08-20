import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import {
  CreateApartmentSchema,
  UpdateApartmentSchema,
  ApartmentIdSchema,
} from '../../common/dtos/inputs/apartment.input.dto';
import { CreateApartmentSwaggerDto } from '../../common/dtos/swagger/create-apartment.swagger.dto';
import { UpdateApartmentSwaggerDto } from '../../common/dtos/swagger/update-apartment.swagger.dto';

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo apartamento' })
  @ApiBody({ type: CreateApartmentSwaggerDto, description: 'Datos para crear el apartamento' })
  @ApiResponse({ status: 201, description: 'Apartamento creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El apartamento ya existe' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createApartmentDto: CreateApartmentDto): Promise<any> {
    try {
      const validatedData = CreateApartmentSchema.parse(createApartmentDto);
      return this.apartmentsService.create(validatedData);
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
  @ApiOperation({ summary: 'Obtener todos los apartamentos' })
  @ApiResponse({ status: 200, description: 'Lista de apartamentos' })
  @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
  findAll(@Query('search') search?: string): Promise<any> {
    if (search) {
      return this.apartmentsService.search(search);
    }
    return this.apartmentsService.findAll();
  }

  @Get('count')
  @ApiOperation({ summary: 'Obtener el total de apartamentos' })
  @ApiResponse({ status: 200, description: 'Total de apartamentos' })
  count() {
    return this.apartmentsService.count();
  }



  @Get(':id')
  @ApiOperation({ summary: 'Obtener un apartamento por ID' })
  @ApiResponse({ status: 200, description: 'Apartamento encontrado' })
  @ApiResponse({ status: 404, description: 'Apartamento no encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  findOne(@Param() params: any): Promise<any> {
    try {
      const validatedParams = ApartmentIdSchema.parse(params);
      return this.apartmentsService.findOne(validatedParams.id);
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
  @ApiOperation({ summary: 'Actualizar un apartamento' })
  @ApiBody({ type: UpdateApartmentSwaggerDto, description: 'Datos para actualizar el apartamento' })
  @ApiResponse({ status: 200, description: 'Apartamento actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Apartamento no encontrado' })
  @ApiResponse({ status: 409, description: 'El apartamento ya existe' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  update(@Param() params: any, @Body() updateApartmentDto: UpdateApartmentDto): Promise<any> {
    try {
      const validatedParams = ApartmentIdSchema.parse(params);
      const validatedData = UpdateApartmentSchema.parse(updateApartmentDto);
      return this.apartmentsService.update(validatedParams.id, validatedData);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un apartamento' })
  @ApiResponse({ status: 204, description: 'Apartamento eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Apartamento no encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  remove(@Param() params: any): Promise<any> {
    try {
      const validatedParams = ApartmentIdSchema.parse(params);
      return this.apartmentsService.remove(validatedParams.id);
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