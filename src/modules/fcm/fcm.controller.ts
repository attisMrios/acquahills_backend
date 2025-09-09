import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

import { FirebaseService } from 'src/common/services/firebase.service';
import { FirebaseAuthGuard } from '../../Auth/firebase-auth.guard';
import { FcmNotificationSchema, FcmTopicSchema } from '../../common/dtos/inputs/fcm.input.dto';
import {
  FcmNotificationSwaggerDto,
  FcmResponseSwaggerDto,
  FcmTopicSwaggerDto,
} from '../../common/dtos/swagger/fcm-topic.swagger.dto';

@ApiTags('fcm')
@Controller('fcm')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('firebase-auth')
export class FcmController {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Suscribe tokens FCM a un topic específico.
   * Permite que múltiples dispositivos reciban notificaciones del mismo topic.
   * @param body Datos del topic y tokens a suscribir
   */
  @Post('subscribe-to-topic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suscribir tokens a un topic',
    description: 'Suscribe múltiples tokens FCM a un topic específico para recibir notificaciones.',
  })
  @ApiBody({
    type: FcmTopicSwaggerDto,
    description: 'Datos del topic y tokens a suscribir',
    examples: {
      ejemplo: {
        value: {
          topic: 'topic_user_user_123',
          tokens: ['fcm_token_example_123456789', 'fcm_token_example_987654321'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens suscritos exitosamente al topic',
    type: FcmResponseSwaggerDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async subscribeToTopic(
    @Body(new ZodValidationPipe(FcmTopicSchema)) body: z.infer<typeof FcmTopicSchema>,
  ) {
    const { topic, tokens, userId } = body;
    // Procesar cada token individualmente ya que el servicio espera un token por vez
    const results: Array<{ token: string; success: boolean; error?: string }> = [];

    for (const token of tokens) {
      try {
        await this.firebaseService.subscribeToTopic(topic, token, userId, undefined);
        results.push({ token, success: true });
      } catch (error) {
        results.push({ token, success: false, error: (error as Error).message });
      }
    }

    return {
      success: true,
      message: `${results.filter((r) => r.success).length} de ${tokens.length} tokens suscritos exitosamente al topic: ${topic}`,
      data: { topic, results },
      response: null,
    };
  }

  /**
   * Envía una notificación push a todos los dispositivos suscritos a un topic específico.
   * @param body Datos de la notificación a enviar
   */
  @Post('send-topic-notification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar notificación a un topic',
    description:
      'Envía una notificación push a todos los dispositivos suscritos a un topic específico.',
  })
  @ApiBody({
    type: FcmNotificationSwaggerDto,
    description: 'Datos de la notificación a enviar',
    examples: {
      ejemplo: {
        value: {
          title: 'Nueva notificación',
          body: 'Tienes una nueva notificación importante',
          topic: 'topic_user_user_123',
          image: 'https://ejemplo.com/imagen.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación enviada exitosamente',
    type: FcmResponseSwaggerDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async sendTopicNotification(
    @Body(new ZodValidationPipe(FcmNotificationSchema)) body: z.infer<typeof FcmNotificationSchema>,
  ) {
    // Convertir el body al formato esperado por el servicio
    const notificationData = {
      title: body.title,
      body: body.body,
      topic: body.topic,
      image: body.image || '', // Proporcionar valor por defecto si image es undefined
    };
    const result = await this.firebaseService.sendFCMTopic(
      notificationData.title,
      notificationData.body,
      notificationData.topic,
      notificationData.image,
    );
    return result;
  }

  @Delete('unsubscribe/:topic')
  @ApiOperation({ summary: 'Desuscribir usuario de un tópico' })
  @ApiResponse({ status: 200, description: 'Usuario desuscrito exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async unsubscribeFromTopic(@Param('topic') topic: string, @Request() req: any) {
    try {
      const response = await this.firebaseService.unsubscribeFromTopic(
        topic,
        req.user.token,
        req.user.id,
      );

      if (response.success) {
        return {
          success: true,
          message: 'Usuario desuscrito exitosamente del tópico',
          topic: topic,
          isSubscribed: false,
        };
      } else {
        return {
          success: false,
          message: response.message,
        };
      }
    } catch (error) {
      console.error('Error al desuscribir usuario del tópico:', error);
      return {
        success: false,
        message: 'Error interno del servidor: ' + error.message,
      };
    }
  }
}
