import { ApiProperty } from '@nestjs/swagger';
import { FcmTokenDto } from './fcm-token.response.dto';
import { UserRole } from '../../enums/user.enums';

export class UserResponseDto {
  @ApiProperty({ description: 'Identificador único del usuario' })
  id: string;

  @ApiProperty({ description: 'Nombre o identificador del usuario' })
  userName: string;

  @ApiProperty({ description: 'Nombre completo del usuario' })
  fullName: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  email: string;

  @ApiProperty({ description: 'Rol del usuario en el sistema', enum: UserRole })
  role: string;

  @ApiProperty({ description: 'Número telefónico del usuario', required: false })
  phone?: string;

  @ApiProperty({ description: 'Dirección de residencia del usuario', required: false })
  address?: string;

  @ApiProperty({ description: 'Fecha de nacimiento del usuario', required: false })
  birthDate?: Date;

  @ApiProperty({ description: 'Documento de identidad del usuario' })
  dni: string;

  @ApiProperty({ description: 'Fecha y hora del último inicio de sesión', required: false })
  lastLogin?: Date;

  @ApiProperty({ description: 'Fecha y hora de creación de la cuenta' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha y hora de la última actualización' })
  updatedAt: Date;

  @ApiProperty({ description: 'Indica si el correo electrónico está verificado' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'FCM tokens del usuario', type: [FcmTokenDto], required: false })
  fcmTokens?: FcmTokenDto[];
}
