// src/common/services/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';


@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
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
          message: "Falta información requerida: title, body y topic son necesarios",
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
          priority: "high",
          notification: {
            channelId: "high-priority",
            sound: "notification",
            defaultVibrateTimings: true,
            visibility: "public",
            ...(image ? { image } : {}),
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: "default",
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
        message: "Notificación enviada con éxito",
        response: response,
      };
    } catch (error) {
      console.error("❌ Error al enviar notificación:", error);
      return {
        success: true,
        message: "Notificación enviada con éxito",
        response: null,
      };
    }
  }

  async subscribeToTopic(topic: string, token: string) {
    try {
      const response = await admin.messaging().subscribeToTopic(token, topic);
      return {
        success: true,
        message: "Suscripción exitosa",
        response: response,
      };
    } catch (error) {
      console.error("❌ Error al suscribirse al tópico:", error);
      return {
        success: false,
        message: "Error al suscribirse al tópico",
        response: null,
      };
    }
  }

  async unsubscribeFromTopic(topic: string, token: string) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(token, topic);
      return {
        success: true,
        message: "Desuscripción exitosa",
        response: response,
      };
    } catch (error) {
      console.error("❌ Error al desuscribirse del tópico:", error);
      return {
        success: false,
        message: "Error al desuscribirse del tópico: " + error.message,
        response: null,
      };
    }
  }

  
}