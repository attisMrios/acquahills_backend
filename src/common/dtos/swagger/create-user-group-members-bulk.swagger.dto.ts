import { ApiProperty } from '@nestjs/swagger';

export class CreateUserGroupMembersBulkSwaggerDto {
  @ApiProperty({ description: 'ID del grupo de usuarios' })
  userGroupId: string;

  @ApiProperty({ 
    description: 'Array de IDs de usuarios a agregar al grupo',
    type: [String],
    example: ['user1', 'user2', 'user3']
  })
  userIds: string[];
} 