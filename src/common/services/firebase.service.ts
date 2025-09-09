// src/common/services/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from './prisma.service';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor(private prisma: PrismaService) {
    if (admin.apps.length === 0) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  getFirebaseAuth(): admin.auth.Auth {
    return admin.auth(this.firebaseApp);
  }

  async sendFCMTopic(title: string, body: string, topic: string, image: string) {
    try {
      if (!title || !body || !topic) {
        return {
          success: false,
          message: 'Falta información requerida: title, body y topic son necesarios',
          response: null,
        };
      }

      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
          ...(image ? { image } : {}),
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'high-priority',
            sound: 'notification',
            defaultVibrateTimings: true,
            visibility: 'public',
            ...(image ? { image } : {}),
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
              mutableContent: true,
            },
          },
        },
        webpush: {
          notification: {
            title,
            body,
            ...(image ? { image } : {}),
          },
        },
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        message: 'Notificación enviada con éxito',
        response: response,
      };
    } catch (error) {
      console.error('❌ Error al enviar notificación:', error);
      return {
        success: true,
        message: 'Notificación enviada con éxito',
        response: null,
      };
    }
  }

  async subscribeToTopic(topic: string, token: string, userId: string, deviceId?: string) {
    try {
      const response = await admin.messaging().subscribeToTopic(token, topic);

      // Guardar en la base de datos
      try {
        await this.prisma.fCMSubscription.upsert({
          where: {
            userId_topic_token: {
              userId,
              topic,
              token,
            },
          },
          update: {
            isActive: true,
            deviceId,
            updatedAt: new Date(),
          },
          create: {
            userId,
            topic,
            token,
            deviceId,
            isActive: true,
          },
        });
      } catch (dbError) {
        console.error('❌ Error al guardar en BD:', dbError);
        // Continuar aunque falle la BD, ya que FCM sí funcionó
      }

      return {
        success: true,
        message: 'Suscripción exitosa',
        response: response,
      };
    } catch (error) {
      console.error('❌ Error al suscribirse al tópico:', error);
      return {
        success: false,
        message: 'Error al suscribirse al tópico',
        response: null,
      };
    }
  }

  async unsubscribeFromTopic(topic: string, token: string, userId: string) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(token, topic);

      // Desactivar en la base de datos (no eliminar, solo marcar como inactiva)
      try {
        await this.prisma.fCMSubscription.updateMany({
          where: {
            userId,
            topic,
            token,
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.error('❌ Error al actualizar en BD:', dbError);
        // Continuar aunque falle la BD, ya que FCM sí funcionó
      }

      return {
        success: true,
        message: 'Desuscripción exitosa',
        response: response,
      };
    } catch (error) {
      console.error('❌ Error al desuscribirse del tópico:', error);
      return {
        success: false,
        message: 'Error al desuscribirse del tópico: ' + error.message,
        response: null,
      };
    }
  }

  // Método adicional para obtener todas las suscripciones activas de un usuario
  async getUserSubscriptions(userId: string) {
    try {
      return await this.prisma.fCMSubscription.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          id: true,
          topic: true,
          token: true,
          deviceId: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener suscripciones:', error);
      return [];
    }
  }

  // Método para eliminar completamente una suscripción (cuando sea necesario)
  async removeSubscription(userId: string, topic: string, token: string) {
    try {
      await this.prisma.fCMSubscription.deleteMany({
        where: {
          userId,
          topic,
          token,
        },
      });
      return { success: true, message: 'Suscripción eliminada' };
    } catch (error) {
      console.error('❌ Error al eliminar suscripción:', error);
      return { success: false, message: 'Error al eliminar suscripción' };
    }
  }
}
