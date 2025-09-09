import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums/user.enums';

export class CreateUserSwaggerDto {
  @ApiProperty() email: string;
  @ApiProperty() userName: string;
  @ApiProperty() fullName: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty() countryCode: string;
  @ApiProperty() phone: string; // Número local sin indicativo
  @ApiProperty() fullPhone: string; // Número internacional sin el signo +
  @ApiProperty({ required: false }) address?: string;
  @ApiProperty({ required: false }) birthDate?: string;
  @ApiProperty() dni: string;
  @ApiProperty({
    required: false,
    default: false,
    description: 'Indica si el usuario tiene habilitado WhatsApp',
  })
  whatsappEnabled?: boolean;
  @ApiProperty() password: string;
}
