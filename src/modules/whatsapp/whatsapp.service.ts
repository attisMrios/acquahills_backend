import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as fs from 'fs';
import * as path from 'path';
import { FirebaseService } from "src/common/services/firebase.service";
import { PrismaService } from "src/common/services/prisma.service";
import { WhatsAppEventEmitterService, WhatsAppMessageEvent, WhatsAppStatusEvent } from "src/common/services/whatsapp-event-emitter.service";
import { v4 as uuidv4 } from 'uuid';
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

      // 1. Obtener configuración de WhatsApp
      const config = await this.prisma.setting.findFirst({
        where: {
          category: 'WHATSAPP'
        }
      });

      if (!config) {
        throw new Error('Configuración de WhatsApp no encontrada');
      }

      const whatsappConfig = JSON.parse(config.jsonSettings);
      // validamos el tipo de mensaje para saber si tiene adjuntos
      const mediaInfo = this.extractMediaInfo(body);
      let mediaData: any = null;

      // Si hay media, descargarlo y guardarlo
      if (mediaInfo) {
        try {
          const mediaUrl = await this.getMediaUrl(mediaInfo, whatsappConfig);
          if (mediaUrl) {
            mediaData = await this.getMediaFile(mediaUrl, whatsappConfig, mediaInfo);
            console.log('📎 Media descargado y guardado:', mediaData.fileName);
          }
        } catch (error) {
          console.error('❌ Error al procesar media:', error);
        }
      }

      // Emitir evento de webhook recibido
      this.eventEmitter.emitWebhookReceived(body);

      // Procesar cada entrada del webhook
      for (const entry of body.entry) {
        console.log(`📝 Procesando entrada: ${entry.id}`);
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            console.log(`💬 Campo 'messages' detectado con ${change.value?.messages?.length || 0} mensajes`);
            await this.processMessages(change.value, mediaData);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al procesar webhook de WhatsApp:', error);
      this.eventEmitter.emitProcessingError(error, 'handleWebhook');
    }
  }

  async getMediaFile(mediaUrl: any, whatsappConfig: any, mediaInfo: any) {
    try {
      // Crear carpeta de archivos si no existe
      const uploadsDir = path.join(process.cwd(), 'uploads', 'whatsapp');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Descargar el archivo
      const mediaFile = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${whatsappConfig.token}`,
        },
      });

      // Generar nombre único para el archivo
      const fileExtension = this.getFileExtension(mediaInfo.mimeType);
      console.log(`🔍 MIME Type original: ${mediaInfo.mimeType}`);
      console.log(`🔍 Extensión detectada: ${fileExtension}`);
      
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Guardar archivo en disco
      fs.writeFileSync(filePath, mediaFile.data);

      // Crear objeto de información del media
      const mediaData = {
        fileName: fileName, // Solo el nombre del archivo (ej: "8d172e63-4228-4476-97aa-ca540cfa6832.jpg")
        originalName: mediaInfo.originalName || `media_${Date.now()}`,
        filePath: fileName, // Solo el nombre del archivo, no la ruta completa
        mimeType: mediaInfo.mimeType,
        fileSize: mediaFile.data.length,
        mediaId: mediaInfo.mediaId,
        sha256: mediaInfo.sha256,
        downloadedAt: new Date().toISOString()
      };

      console.log(`💾 Archivo guardado: ${filePath}`);
      console.log(`📁 Media data creado:`, {
        fileName: mediaData.fileName,
        filePath: mediaData.filePath,
        originalName: mediaData.originalName,
        fileSize: mediaData.fileSize
      });
      return mediaData;
    } catch (error) {
      console.error('❌ Error al descargar/guardar archivo:', error);
      throw error;
    }
  }
  private async getMediaUrl(mediaInfo: { type: any; mediaId: any; mimeType: any; sha256: any; } | null, whatsappConfig: any) {
    if (!mediaInfo) return null;

    const mediaUrlRes = await axios.get(
      `https://graph.facebook.com/${whatsappConfig.apiVersion}/${mediaInfo.mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${whatsappConfig.token}`,
        },
      }
    );
    const mediaUrl = mediaUrlRes.data.url;
    return mediaUrl;
  }

  private extractMediaInfo(payload): { type: any; mediaId: any; mimeType: any; sha256: any; originalName?: string; } | null {
    const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return null;

    console.log(`🔍 extractMediaInfo - Tipo de mensaje: ${message.type}`);
    console.log(`🔍 extractMediaInfo - Datos del mensaje:`, {
      type: message.type,
      from: message.from,
      id: message.id,
      timestamp: message.timestamp
    });

    const mediaTypes = ['image', 'video', 'document', 'audio', 'sticker'];
    if (mediaTypes.includes(message.type) && message[message.type]?.id) {
      const mediaData = message[message.type];
      console.log(`🔍 extractMediaInfo - Datos del media:`, {
        id: mediaData.id,
        mime_type: mediaData.mime_type,
        sha256: mediaData.sha256,
        filename: mediaData.filename,
        caption: mediaData.caption
      });
      
      // Generar nombre más descriptivo según el tipo de media
      let originalName = mediaData.filename || mediaData.caption;
      
      if (!originalName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        switch (message.type) {
          case 'audio':
            originalName = `audio_${timestamp}`;
            break;
          case 'image':
            originalName = `imagen_${timestamp}`;
            break;
          case 'video':
            originalName = `video_${timestamp}`;
            break;
          case 'document':
            originalName = `documento_${timestamp}`;
            break;
          case 'sticker':
            originalName = `sticker_${timestamp}`;
            break;
          default:
            originalName = `media_${timestamp}`;
        }
      }
      
      const result = {
        type: message.type,
        mediaId: mediaData.id,
        mimeType: mediaData.mime_type,
        sha256: mediaData.sha256,
        originalName: originalName
      };
      
      console.log(`🔍 extractMediaInfo - Resultado:`, {
        type: result.type,
        mediaId: result.mediaId,
        mimeType: result.mimeType,
        sha256: result.sha256,
        originalName: result.originalName
      });
      return result;
    }

    return null;
  }

  private async processIncomingMessage(message: any, metadata: any, mediaData?: any) {
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
        rawPayload: {
          type: message.type,
          from: message.from,
          id: message.id,
          timestamp: message.timestamp
        },
        conversationId: this.generateConversationId(message.from),
        receivedAt: new Date(parseInt(message.timestamp) * 1000),
        status: 'sent',
        media: mediaData ? mediaData.filePath : undefined
      };

      console.log('🔍 messageData preparado:', {
        messageId: messageData.messageId,
        waId: messageData.waId,
        messageType: messageData.messageType,
        content: messageData.content,
        media: messageData.media,
        hasMediaData: !!mediaData,
        mediaDataKeys: mediaData ? Object.keys(mediaData) : 'null',
        mediaDataContent: mediaData ? JSON.stringify(mediaData) : 'null'
      });

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
        media: messageData.media, // Incluir información del media para el frontend
        rawPayload: {
          type: messageData.messageType,
          content: messageData.content,
          timestamp: messageData.receivedAt.toISOString()
        },
      };

      // Emitir evento para SSE
      console.log('📡 Emitiendo evento SSE con media:', {
        messageId: messageEvent.messageId,
        messageType: messageEvent.messageType,
        media: messageEvent.media,
        hasMedia: !!messageEvent.media,
        mediaContent: messageEvent.media ? JSON.stringify(messageEvent.media) : 'null',
        messageDataMedia: messageData.media,
        mediaData: mediaData ? JSON.stringify(mediaData) : 'null'
      });
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

  private async processMessages(value: any, mediaData?: any) {
    // Procesar mensajes recibidos
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        message.from = `${message.from} - ${value.contacts[0].profile.name}`;
        await this.processIncomingMessage(message, value.metadata, mediaData);
      }
    }

    // Procesar estados de mensajes enviados
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await this.processMessageStatus(status);
      }
    }
  }

  async sendTextMessage(message: string, phoneNumber: string) {
    try {
      console.log('📤 Enviando mensaje de WhatsApp:', {
        to: phoneNumber,
        content: message,
        timestamp: new Date().toISOString()
      });

      // 1. Obtener configuración de WhatsApp
      const config = await this.prisma.setting.findFirst({
        where: {
          category: 'WHATSAPP'
        }
      });

      if (!config) {
        throw new Error('Configuración de WhatsApp no encontrada');
      }

      const whatsappConfig = JSON.parse(config.jsonSettings);

      // 2. Enviar mensaje a WhatsApp API
      const url = `https://graph.facebook.com/${whatsappConfig.apiVersion}/${whatsappConfig.cellphoneNumberId}/messages`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappConfig.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error de WhatsApp API: ${errorData.error?.message || 'Error desconocido'}`);
      }

      const responseData = await response.json();
      console.log('✅ Mensaje enviado exitosamente:', responseData);

      // 3. Almacenar mensaje en la base de datos
      const messageData: WhatsAppMessageData = {
        messageId: responseData.messages?.[0]?.id || `msg_${Date.now()}`,
        waId: phoneNumber,
        contactName: `Usuario ${phoneNumber}`, // Se puede mejorar obteniendo el nombre real
        phoneNumberId: whatsappConfig.cellphoneNumberId,
        direction: 'outbound',
        messageType: 'text',
        content: message,
        rawPayload: {
          success: true,
          messageId: responseData.messages?.[0]?.id,
          timestamp: new Date().toISOString()
        },
        conversationId: this.generateConversationId(phoneNumber),
        receivedAt: new Date(),
        status: 'sent' // Estado inicial del mensaje
      };

      // Guardar en BD usando el servicio de mensajes
      await this.messageService.storeMessage(messageData);

      // 4. Emitir evento para SSE (tiempo real)
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
        media: messageData.media, // Incluir información del media para el frontend
        rawPayload: {
          type: messageData.messageType,
          content: messageData.content,
          timestamp: messageData.receivedAt.toISOString()
        },
      };

      console.log('📡 Emitiendo evento SSE para mensaje enviado con media:', {
        messageId: messageEvent.messageId,
        messageType: messageEvent.messageType,
        media: messageEvent.media,
        hasMedia: !!messageEvent.media
      });
      this.eventEmitter.emitNewMessage(messageEvent);



      // 5. Retornar respuesta exitosa
      return {
        success: true,
        messageId: messageData.messageId,
        whatsappResponse: responseData,
        storedMessage: messageData
      };

    } catch (error) {
      console.error('❌ Error al enviar mensaje de WhatsApp:', error);

      // Emitir error para SSE
      this.eventEmitter.emitProcessingError(error, 'sendTextMessage');

      // Retornar error estructurado
      return {
        success: false,
        error: error.message || 'Error desconocido al enviar mensaje',
        timestamp: new Date().toISOString()
      };
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

  /**
   * Obtiene la extensión del archivo basado en el MIME type
   */
  private getFileExtension(mimeType: string): string {
    console.log(`🔍 getFileExtension llamado con: "${mimeType}"`);
    
    // Limpiar el MIME type removiendo parámetros adicionales como codecs
    const cleanMimeType = mimeType.split(';')[0].trim();
    console.log(`🔍 MIME Type limpio: "${cleanMimeType}"`);
    
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/avi': 'avi',
      'video/mov': 'mov',
      'video/wmv': 'wmv',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/m4a': 'm4a',
      'audio/aac': 'aac',
      'audio/flac': 'flac',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt'
    };

    const extension = mimeToExt[cleanMimeType] || 'bin';
    console.log(`🔍 Extensión encontrada: "${extension}"`);
    console.log(`🔍 Mapeo completo: "${cleanMimeType}" -> "${extension}"`);
    
    return extension;
  }
}