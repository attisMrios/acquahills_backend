import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';

export class UpdateUserDto {
  @ApiProperty({ description: 'Usuario actualizado', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ description: 'Mensaje de confirmación' })
  message: string;
}
