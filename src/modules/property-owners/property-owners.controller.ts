import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePropertyOwnerSwaggerDto } from '../../common/dtos/swagger/create-property-owner.swagger.dto';
import { CreatePropertyOwnersBulkSwaggerDto } from '../../common/dtos/swagger/create-property-owners-bulk.swagger.dto';
import { UpdatePropertyOwnerSwaggerDto } from '../../common/dtos/swagger/update-property-owner.swagger.dto';
import {
  CreatePropertyOwnerDto,
  CreatePropertyOwnersBulkDto,
} from './dto/create-property-owner.dto';
import { UpdatePropertyOwnerDto } from './dto/update-property-owner.dto';
import { PropertyOwnersService } from './property-owners.service';

@ApiTags('Apartment Owners')
@Controller('property-owners')
export class PropertyOwnersController {
  constructor(private readonly propertyOwnersService: PropertyOwnersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva relación de propietario de apartamento' })
  @ApiBody({
    type: CreatePropertyOwnerSwaggerDto,
    description: 'Datos para crear la relación de propietario',
  })
  @ApiResponse({ status: 201, description: 'Propietario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'La relación de propietario ya existe' })
  create(@Body() createPropertyOwnerDto: CreatePropertyOwnerDto) {
    return this.propertyOwnersService.create(createPropertyOwnerDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Crear múltiples relaciones de propietarios de apartamento' })
  @ApiBody({
    type: CreatePropertyOwnersBulkSwaggerDto,
    description: 'Datos para crear múltiples relaciones de propietarios',
  })
  @ApiResponse({ status: 201, description: 'Propietarios creados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Algunas relaciones de propietario ya existen' })
  createMany(@Body() createPropertyOwnersListDto: CreatePropertyOwnersBulkDto) {
    return this.propertyOwnersService.createMany(createPropertyOwnersListDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una relación de propietario' })
  @ApiBody({
    type: UpdatePropertyOwnerSwaggerDto,
    description: 'Datos para actualizar la relación de propietario',
  })
  @ApiResponse({ status: 200, description: 'Propietario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Propietario no encontrado' })
  @ApiResponse({ status: 409, description: 'La relación de propietario ya existe' })
  update(@Param('id') id: string, @Body() updatePropertyOwnerDto: UpdatePropertyOwnerDto) {
    return this.propertyOwnersService.update(id, updatePropertyOwnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una relación de propietario por ID' })
  @ApiResponse({ status: 200, description: 'Propietario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Propietario no encontrado' })
  remove(@Param('id') id: string) {
    return this.propertyOwnersService.remove(id);
  }

  @Delete('apartment/:apartmentId/user/:userId')
  @ApiOperation({ summary: 'Eliminar una relación de propietario por apartmentId y userId' })
  @ApiResponse({ status: 200, description: 'Propietario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Propietario no encontrado' })
  removeByApartmentAndUser(
    @Param('apartmentId') apartmentId: string,
    @Param('userId') userId: string,
  ) {
    return this.propertyOwnersService.removeByApartmentAndUser(parseInt(apartmentId), userId);
  }
}
