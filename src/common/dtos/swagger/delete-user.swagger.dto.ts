import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiProperty({ description: 'ID del usuario eliminado' })
  userId: string;

  @ApiProperty({ description: 'Mensaje de confirmación' })
  message: string;
}
