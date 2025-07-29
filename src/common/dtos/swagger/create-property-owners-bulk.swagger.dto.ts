import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyOwnersBulkSwaggerDto {
  @ApiProperty({ description: 'ID del apartamento', type: Number })
  apartmentId: number;

  @ApiProperty({ 
    description: 'Array de IDs de usuarios propietarios',
    type: [String],
    example: ['user1', 'user2', 'user3']
  })
  userIds: string[];
} 