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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo apartamento' })
  @ApiResponse({ status: 201, description: 'Apartamento creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El apartamento ya existe' })
  create(@Body() createApartmentDto: CreateApartmentDto) {
    return this.apartmentsService.create(createApartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los apartamentos' })
  @ApiResponse({ status: 200, description: 'Lista de apartamentos' })
  @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
  findAll(@Query('search') search?: string) {
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
  findOne(@Param('id') id: string) {
    return this.apartmentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un apartamento' })
  @ApiResponse({ status: 200, description: 'Apartamento actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Apartamento no encontrado' })
  @ApiResponse({ status: 409, description: 'El apartamento ya existe' })
  update(@Param('id') id: string, @Body() updateApartmentDto: UpdateApartmentDto) {
    return this.apartmentsService.update(+id, updateApartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un apartamento' })
  @ApiResponse({ status: 204, description: 'Apartamento eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Apartamento no encontrado' })
  remove(@Param('id') id: string) {
    return this.apartmentsService.remove(+id);
  }
} 