import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';

export class UsersResponseDto {
  @ApiProperty({ description: 'Lista de usuarios', type: [UserResponseDto] })
  users: UserResponseDto[];

  @ApiProperty({ description: 'Total de usuarios' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Límite por página' })
  limit: number;
}
