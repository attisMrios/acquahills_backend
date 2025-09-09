import { ApiProperty } from '@nestjs/swagger';

export class FcmTokenDto {
  @ApiProperty({ description: 'Token único de Firebase Cloud Messaging =)' })
  token: string;

  @ApiProperty({ description: 'Fecha de la última actualización del token' })
  lastTokenUpdate: Date;
}
