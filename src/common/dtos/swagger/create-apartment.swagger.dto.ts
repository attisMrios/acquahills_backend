import { ApiProperty } from '@nestjs/swagger';

export class CreateApartmentSwaggerDto {
  @ApiProperty({ description: 'Número de apartamento', maxLength: 10 })
  apartment: string;

  @ApiProperty({ description: 'Casa o edificio', maxLength: 50 })
  house: string;

  @ApiProperty({ description: 'Dirección completa', maxLength: 150 })
  fullAddress: string;

  @ApiProperty({ description: 'Bloque', maxLength: 10 })
  block: string;

  @ApiProperty({ description: 'Piso', maxLength: 10 })
  floor: string;

  @ApiProperty({ description: 'Torre', maxLength: 10 })
  tower: string;
} 