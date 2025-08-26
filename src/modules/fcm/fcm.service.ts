import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class FcmService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Suscribe un token a múltiples topics usando FCM nativo
   * FCM maneja internamente la suscripción, no necesitamos almacenar nada
   */
  private async subscribeToTopics(token: string, topic: string): Promise<void> {
    try {
      // Validar datos
      if (!topic || !token) {
        throw new Error('Topic y token son requeridos');
      }

      // Suscribir tokens al topic
      const response = await admin.messaging().subscribeToTopic([token], topic);

      // return {
      //   success: true,
      //   successCount: response.successCount,
      //   failureCount: response.failureCount,
      // };
    } catch (error) {
      console.error('Error al suscribir al topic:', error);
      throw new InternalServerErrorException(
        (error as Error).message || 'Error desconocido al suscribir al topic'
      );
    }
  }

  async SendTopicNotification(data: { title: string; body: string; topic: string; image: string }) {
    try {
      if (!data.title || !data.body || !data.topic) {
        return {
          success: false,
          message: 'Falta información requerida: title, body y topic son necesarios',
          data: data,
          response: null,
        };
      }

      const message: admin.messaging.Message = {
        topic: data.topic,
        notification: {
          title: data.title,
          body: data.body,
          ...(data.image ? { image: data.image } : {}),
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'high-priority',
            sound: 'notification',
            defaultVibrateTimings: true,
            visibility: 'public',
            ...(data.image ? { image: data.image } : {}),
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title: data.title, body: data.body },
              sound: 'default',
              mutableContent: true,
            },
          },
        },
        webpush: {
          notification: {
            title: data.title,
            body: data.body,
            ...(data.image ? { image: data.image } : {}),
          },
        },
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        message: 'Notificación enviada con éxito',
        data: data,
        response: response,
      };
    } catch (error) {
      console.error('❌ Error al enviar notificación:', error);
      return {
        success: true,
        message: 'Notificación enviada con éxito',
        data: error,
        response: null,
      };
    }
  }
}
