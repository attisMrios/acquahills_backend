import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyOwnerSwaggerDto {
  @ApiProperty({ description: 'ID del usuario propietario' })
  userId: string;

  @ApiProperty({ description: 'ID del apartamento', type: Number })
  apartmentId: number;
}
