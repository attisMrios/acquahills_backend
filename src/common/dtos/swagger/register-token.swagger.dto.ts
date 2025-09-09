import { ApiProperty } from '@nestjs/swagger';

export class RegisterTokenSwaggerDto {
  @ApiProperty({
    description: 'Token FCM del dispositivo',
    example: 'fcm_token_example_123456789',
    minLength: 1,
  })
  fcmToken: string;
}
