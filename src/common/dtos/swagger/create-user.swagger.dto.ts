import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums/user.enums';

export class CreateUserSwaggerDto {
  @ApiProperty() email: string;
  @ApiProperty() userName: string;
  @ApiProperty() fullName: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty({ required: false }) phone?: string;
  @ApiProperty({ required: false }) address?: string;
  @ApiProperty({ required: false }) birthDate?: string;
  @ApiProperty() dni: string;
  @ApiProperty() password: string;
}