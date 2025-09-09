import { ApiProperty } from '@nestjs/swagger';

export class VehicleInfoDto {
  @ApiProperty({
    description: 'Código/placa del vehículo',
    example: 'ABC123',
  })
  code: string;

  @ApiProperty({
    description: 'Marca del vehículo',
    example: 'Toyota',
  })
  brand: string;

  @ApiProperty({
    description: 'Modelo del vehículo',
    example: 'Corolla',
  })
  model: string;

  @ApiProperty({
    description: 'Color del vehículo',
    example: 'Blanco',
  })
  color: string;

  @ApiProperty({
    description: 'Tipo de vehículo',
    example: 'CARRO',
  })
  vehicleType: string;
}

export class OwnerInfoDto {
  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre completo del propietario',
    example: 'Juan Pérez',
  })
  fullName: string;
}

export class VehicleOwnerResponseDto {
  @ApiProperty({
    description: 'Información del vehículo',
    type: VehicleInfoDto,
  })
  vehicle: VehicleInfoDto;

  @ApiProperty({
    description: 'Información del propietario',
    type: OwnerInfoDto,
  })
  owner: OwnerInfoDto;
}
