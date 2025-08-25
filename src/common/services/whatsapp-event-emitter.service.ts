import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface WhatsAppMessageEvent {
  messageId: string;
  waId: string;
  contactName?: string;
  phoneNumberId: string;
  direction: 'inbound' | 'outbound';
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'button' | 'location' | 'sticker';
  content?: string;
  conversationId?: string;
  flowTrigger?: string;
  receivedAt: Date;
  rawPayload: any;
}

export interface WhatsAppStatusEvent {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  recipientId: string;
  timestamp: Date;
}

@Injectable()
export class WhatsAppEventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emite evento cuando se recibe un nuevo mensaje de WhatsApp
   */
  emitNewMessage(messageEvent: WhatsAppMessageEvent): void {
    try {
      this.eventEmitter.emit('whatsapp.message.received', messageEvent);
      console.log(`📡 Evento emitido: whatsapp.message.received para mensaje ${messageEvent.messageId}`);
    } catch (error) {
      console.error('❌ Error al emitir evento de mensaje:', error);
    }
  }

  /**
   * Emite evento cuando cambia el estado de un mensaje
   */
  emitMessageStatus(statusEvent: WhatsAppStatusEvent): void {
    try {
      this.eventEmitter.emit('whatsapp.message.status', statusEvent);
      console.log(`📡 Evento emitido: whatsapp.message.status para mensaje ${statusEvent.messageId}`);
    } catch (error) {
      console.error('❌ Error al emitir evento de estado:', error);
    }
  }

  /**
   * Emite evento cuando se recibe un webhook de WhatsApp
   */
  emitWebhookReceived(webhookData: any): void {
    try {
      this.eventEmitter.emit('whatsapp.webhook.received', webhookData);
      console.log('📡 Evento emitido: whatsapp.webhook.received');
    } catch (error) {
      console.error('❌ Error al emitir evento de webhook:', error);
    }
  }

  /**
   * Emite evento cuando hay un error en el procesamiento
   */
  emitProcessingError(error: any, context: string): void {
    try {
      this.eventEmitter.emit('whatsapp.processing.error', { error, context, timestamp: new Date() });
      console.log(`📡 Evento emitido: whatsapp.processing.error para contexto: ${context}`);
    } catch (emitError) {
      console.error('❌ Error al emitir evento de error:', emitError);
    }
  }

  /**
   * Emite evento cuando se conecta un administrador
   */
  emitAdminConnected(adminId: string, adminEmail: string): void {
    try {
      this.eventEmitter.emit('whatsapp.admin.connected', { adminId, adminEmail, timestamp: new Date() });
      console.log(`📡 Evento emitido: whatsapp.admin.connected para admin: ${adminEmail}`);
    } catch (error) {
      console.error('❌ Error al emitir evento de conexión de admin:', error);
    }
  }

  /**
   * Emite evento cuando se desconecta un administrador
   */
  emitAdminDisconnected(adminId: string, adminEmail: string): void {
    try {
      this.eventEmitter.emit('whatsapp.admin.disconnected', { adminId, adminEmail, timestamp: new Date() });
      console.log(`📡 Evento emitido: whatsapp.admin.disconnected para admin: ${adminEmail}`);
    } catch (error) {
      console.error('❌ Error al emitir evento de desconexión de admin:', error);
    }
  }
}
