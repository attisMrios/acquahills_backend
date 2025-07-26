import { ApiProperty } from '@nestjs/swagger';

export class UserGroup {
  @ApiProperty({ description: 'ID único del grupo' })
  id: string;

  @ApiProperty({ description: 'Nombre del grupo' })
  name: string;

  @ApiProperty({ description: 'Descripción del grupo', required: false })
  description?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;

  @ApiProperty({ description: 'Miembros del grupo', type: 'array', required: false })
  members?: UserGroupMember[];
}

export class UserGroupMember {
  @ApiProperty({ description: 'ID único del miembro' })
  id: string;

  @ApiProperty({ description: 'ID del usuario' })
  userId: string;

  @ApiProperty({ description: 'ID del grupo' })
  userGroupId: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;

  @ApiProperty({ description: 'Información del usuario', required: false })
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    dni?: string;
  };
} 