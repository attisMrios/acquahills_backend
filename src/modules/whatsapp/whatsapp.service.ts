import { Injectable } from "@nestjs/common";
import { FirebaseService } from "src/common/services/firebase.service";
import { PrismaService } from "src/common/services/prisma.service";
import { WhatsAppEventEmitterService, WhatsAppMessageEvent, WhatsAppStatusEvent } from "src/common/services/whatsapp-event-emitter.service";
import { WhatsappWebhookDto } from "./dtos/whatsapp-webhook.dto";
import { WhatsAppMessageData, WhatsAppMessageService } from "./whatsapp-message.service";

@Injectable()
export class WhatsappService {
  constructor(
    private readonly prisma: PrismaService, 
    private firebase: FirebaseService,
    private readonly messageService: WhatsAppMessageService,
    private readonly eventEmitter: WhatsAppEventEmitterService
  ) { }

  async handleWebhook(body: WhatsappWebhookDto) {
    try {
      console.log('📱 Procesando webhook de WhatsApp');
      console.log('📊 Estructura del webhook:', {
        entries: body.entry?.length || 0,
        hasChanges: body.entry?.some(entry => entry.changes?.length > 0) || false
      });

      // Emitir evento de webhook recibido
      this.eventEmitter.emitWebhookReceived(body);

      // Procesar cada entrada del webhook
      for (const entry of body.entry) {
        console.log(`📝 Procesando entrada: ${entry.id}`);
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            console.log(`💬 Campo 'messages' detectado con ${change.value?.messages?.length || 0} mensajes`);
            await this.processMessages(change.value);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al procesar webhook de WhatsApp:', error);
      this.eventEmitter.emitProcessingError(error, 'handleWebhook');
    }
  }

  private async processMessages(value: any) {
    // Procesar mensajes recibidos
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        message.from = `${message.from} - ${value.contacts[0].profile.name}`;
        await this.processIncomingMessage(message, value.metadata);
      }
    }

    // Procesar estados de mensajes enviados
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await this.processMessageStatus(status);
      }
    }
  }

  private async processIncomingMessage(message: any, metadata: any) {
    try {
      console.log('📨 Mensaje entrante procesado:', {
        from: message.from,
        type: message.type,
        timestamp: message.timestamp
      });

      // Extraer información del mensaje
      const messageContent = this.extractMessageContent(message);
      const contactName = this.extractContactName(message, metadata);

      // Preparar datos para almacenar en BD
      const messageData: WhatsAppMessageData = {
        messageId: message.id,
        waId: message.from,
        contactName: contactName,
        phoneNumberId: metadata.phone_number_id,
        direction: 'inbound',
        messageType: this.mapMessageType(message.type),
        content: messageContent,
        rawPayload: message,
        conversationId: this.generateConversationId(message.from),
        receivedAt: new Date(parseInt(message.timestamp) * 1000),
      };

      // Almacenar mensaje en la base de datos
      await this.messageService.storeMessage(messageData);

      // Preparar evento para SSE
      const messageEvent: WhatsAppMessageEvent = {
        messageId: messageData.messageId,
        waId: messageData.waId,
        contactName: messageData.contactName,
        phoneNumberId: messageData.phoneNumberId,
        direction: messageData.direction,
        messageType: messageData.messageType,
        content: messageData.content,
        conversationId: messageData.conversationId,
        flowTrigger: messageData.flowTrigger,
        receivedAt: messageData.receivedAt,
        rawPayload: messageData.rawPayload,
      };

      // Emitir evento para SSE
      this.eventEmitter.emitNewMessage(messageEvent);

      // Enviar notificación FCM como backup
      await this.sendWhatsAppNotification(
        message.from,
        contactName,
        messageContent,
        message.type
      );

    } catch (error) {
      console.error('❌ Error al procesar mensaje entrante:', error);
      this.eventEmitter.emitProcessingError(error, 'processIncomingMessage');
    }
  }

  private async processMessageStatus(status: any) {
    try {
      console.log('📊 Estado del mensaje:', {
        id: status.id,
        status: status.status,
        recipient: status.recipient_id,
        timestamp: status.timestamp
      });

      // Actualizar estado del mensaje en la base de datos
      await this.messageService.updateMessageStatus(status.id, status.status);

      // Preparar evento de estado para SSE
      const statusEvent: WhatsAppStatusEvent = {
        messageId: status.id,
        status: status.status,
        recipientId: status.recipient_id,
        timestamp: new Date(parseInt(status.timestamp) * 1000),
      };

      // Emitir evento de estado para SSE
      this.eventEmitter.emitMessageStatus(statusEvent);

    } catch (error) {
      console.error('❌ Error al procesar estado del mensaje:', error);
      this.eventEmitter.emitProcessingError(error, 'processMessageStatus');
    }
  }

  private extractMessageContent(message: any): string {
    switch (message.type) {
      case 'text':
        return message.text?.body || 'Mensaje de texto';
      case 'image':
        return '📷 Imagen';
      case 'document':
        return '📄 Documento';
      case 'audio':
        return '🎵 Audio';
      case 'video':
        return '🎥 Video';
      case 'location':
        return '📍 Ubicación';
      case 'contact':
        return '👤 Contacto';
      case 'sticker':
        return '😀 Sticker';
      default:
        return 'Mensaje';
    }
  }

  private extractContactName(message: any, metadata: any): string {
    // Intentar obtener el nombre del contacto
    if (metadata.contacts && Array.isArray(metadata.contacts)) {
      const contact = metadata.contacts.find(c => c.wa_id === message.from);
      if (contact?.profile?.name) {
        return contact.profile.name;
      }
    }
    
    // Si no hay nombre, usar el número de teléfono
    return `+${message.from}`;
  }

  private mapMessageType(whatsappType: string): 'text' | 'image' | 'audio' | 'video' | 'document' | 'button' | 'location' | 'sticker' {
    switch (whatsappType) {
      case 'text':
        return 'text';
      case 'image':
        return 'image';
      case 'document':
        return 'document';
      case 'audio':
        return 'audio';
      case 'video':
        return 'video';
      case 'location':
        return 'location';
      case 'contact':
        return 'button'; // Mapear contact a button por similitud
      case 'sticker':
        return 'sticker';
      default:
        return 'text';
    }
  }

  private generateConversationId(waId: string): string {
    // Generar un ID de conversación basado en el waId
    // Esto permite agrupar mensajes de la misma conversación
    return `conv_${waId}_${Date.now()}`;
  }

  private async sendWhatsAppNotification(
    phoneNumber: string,
    contactName: string,
    messageContent: string,
    messageType: string
  ) {
    try {
      const title = `Nuevo mensaje de ${contactName}`;
      const body = messageContent;
      const topic = 'whatsapp_messages'; // Tópico para notificaciones de WhatsApp
      
      console.log('🔔 Enviando notificación FCM:', { title, body, topic });

      const result = await this.firebase.sendFCMTopic(title, body, topic, '');
      
      if (result.success) {
        console.log('✅ Notificación FCM enviada exitosamente');
      } else {
        console.error('❌ Error al enviar notificación FCM:', result.message);
      }

    } catch (error) {
      console.error('❌ Error al enviar notificación FCM:', error);
      this.eventEmitter.emitProcessingError(error, 'sendWhatsAppNotification');
    }
  }

  // ===== MÉTODOS PARA CONSULTAS DE MENSAJES =====

  /**
   * Obtiene el historial de mensajes de un contacto
   */
  async getContactHistory(waId: string, limit: number = 50, offset: number = 0) {
    return await this.messageService.getContactHistory(waId, limit, offset);
  }

  /**
   * Obtiene mensajes de una conversación específica
   */
  async getConversationMessages(conversationId: string, limit: number = 100, offset: number = 0) {
    return await this.messageService.getConversationMessages(conversationId, limit, offset);
  }

  /**
   * Busca mensajes por contenido
   */
  async searchMessages(searchTerm: string, messageType?: string, limit: number = 50) {
    return await this.messageService.searchMessages(searchTerm, messageType as any, limit);
  }

  /**
   * Obtiene estadísticas de mensajes
   */
  async getMessageStats() {
    return await this.messageService.getMessageStats();
  }

  /**
   * Actualiza el estado de un mensaje
   */
  async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read' | 'failed') {
    return await this.messageService.updateMessageStatus(messageId, status);
  }
}