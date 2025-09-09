import { ApiProperty } from '@nestjs/swagger';

export class CreateUserGroupSwaggerDto {
  @ApiProperty({ description: 'Nombre del grupo', maxLength: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción del grupo', required: false })
  description?: string;
}
