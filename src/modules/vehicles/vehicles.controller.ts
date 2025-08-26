import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleOwnerResponseDto } from './dto/vehicle-owner.response.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('search-by-plate/:plate')
  @ApiOperation({
    summary: 'Buscar propietario de vehículo por placa',
    description: 'Retorna la información del vehículo y del propietario basado en su placa',
  })
  @ApiParam({
    name: 'plate',
    description: 'Placa del vehículo',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del vehículo y propietario encontrada exitosamente',
    type: VehicleOwnerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado o sin propietario asignado',
  })
  findOwnerByPlate(@Param('plate') plate: string): Promise<VehicleOwnerResponseDto> {
    return this.vehiclesService.findOwnerByPlate(plate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
