import { ApiProperty } from '@nestjs/swagger';

export class PropertyOwner {
  @ApiProperty({ description: 'ID único del propietario del apartamento' })
  id: string;

  @ApiProperty({ description: 'ID del usuario propietario' })
  userId: string;

  @ApiProperty({ description: 'ID del apartamento' })
  apartmentId: number;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
