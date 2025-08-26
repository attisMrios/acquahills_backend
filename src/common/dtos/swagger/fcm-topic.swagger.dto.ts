import { ApiProperty } from '@nestjs/swagger';

export class FcmTopicSwaggerDto {
  @ApiProperty({
    description: 'Nombre del topic al cual suscribir o enviar notificación',
    example: 'topic_user_user_123',
    minLength: 1,
  })
  topic: string;

  @ApiProperty({
    description: 'Array de tokens FCM de los dispositivos',
    example: ['fcm_token_example_123456789', 'fcm_token_example_987654321'],
    type: [String],
    minItems: 1,
  })
  tokens: string[];
}

export class FcmNotificationSwaggerDto {
  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nueva notificación',
    minLength: 1,
  })
  title: string;

  @ApiProperty({
    description: 'Cuerpo del mensaje de la notificación',
    example: 'Tienes una nueva notificación importante',
    minLength: 1,
  })
  body: string;

  @ApiProperty({
    description: 'Nombre del topic al cual enviar la notificación',
    example: 'topic_user_user_123',
    minLength: 1,
  })
  topic: string;

  @ApiProperty({
    description: 'URL de la imagen de la notificación (opcional)',
    example: 'https://ejemplo.com/imagen.jpg',
    required: false,
  })
  image?: string;
}

export class FcmResponseSwaggerDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Operación completada exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Datos de la operación realizada',
    example: { topic: 'topic_user_user_123', tokens: ['token1', 'token2'] },
  })
  data: any;

  @ApiProperty({
    description: 'Respuesta de Firebase (si aplica)',
    example: null,
    required: false,
  })
  response?: any;
}
