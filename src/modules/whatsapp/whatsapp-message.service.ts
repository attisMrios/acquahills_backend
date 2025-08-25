import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

export interface WhatsAppMessageData {
  messageId: string;
  waId: string;
  contactName?: string;
  phoneNumberId: string;
  direction: 'inbound' | 'outbound';
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'button' | 'location' | 'sticker';
  content?: string;
  rawPayload: any;
  conversationId?: string;
  flowTrigger?: string;
  receivedAt: Date;
}

@Injectable()
export class WhatsAppMessageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Almacena un mensaje de WhatsApp en la base de datos
   */
  async storeMessage(messageData: WhatsAppMessageData) {
    try {
      const message = await this.prisma.whatsappMessage.create({
        data: {
          messageId: messageData.messageId,
          waId: messageData.waId,
          contactName: messageData.contactName,
          phoneNumberId: messageData.phoneNumberId,
          direction: messageData.direction,
          messageType: messageData.messageType,
          content: messageData.content,
          rawPayload: messageData.rawPayload,
          conversationId: messageData.conversationId,
          flowTrigger: messageData.flowTrigger,
          receivedAt: messageData.receivedAt,
        },
      });

      console.log(`💾 Mensaje almacenado en BD: ${message.id} - ${message.messageId}`);
      return message;
    } catch (error) {
      console.error('❌ Error al almacenar mensaje en BD:', error);
      throw error;
    }
  }

  /**
   * Almacena múltiples mensajes de WhatsApp
   */
  async storeMultipleMessages(messagesData: WhatsAppMessageData[]) {
    try {
      const messages = await this.prisma.whatsappMessage.createMany({
        data: messagesData,
        skipDuplicates: true, // Evita duplicados por messageId
      });

      console.log(`💾 ${messages.count} mensajes almacenados en BD`);
      return messages;
    } catch (error) {
      console.error('❌ Error al almacenar múltiples mensajes en BD:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de mensajes de un contacto específico
   */
  async getContactHistory(waId: string, limit: number = 50, offset: number = 0) {
    try {
      const messages = await this.prisma.whatsappMessage.findMany({
        where: { waId },
        orderBy: { receivedAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          messageId: true,
          direction: true,
          messageType: true,
          content: true,
          status: true,
          receivedAt: true,
          contactName: true,
        },
      });

      return messages;
    } catch (error) {
      console.error('❌ Error al obtener historial del contacto:', error);
      throw error;
    }
  }

  /**
   * Obtiene mensajes por conversación
   */
  async getConversationMessages(conversationId: string, limit: number = 100, offset: number = 0) {
    try {
      const messages = await this.prisma.whatsappMessage.findMany({
        where: { conversationId },
        orderBy: { receivedAt: 'asc' }, // Orden cronológico para conversación
        take: limit,
        skip: offset,
      });

      return messages;
    } catch (error) {
      console.error('❌ Error al obtener mensajes de conversación:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un mensaje
   */
  async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read' | 'failed') {
    try {
      const message = await this.prisma.whatsappMessage.update({
        where: { messageId },
        data: { status },
      });

      console.log(`📊 Estado del mensaje ${messageId} actualizado a: ${status}`);
      return message;
    } catch (error) {
      console.error('❌ Error al actualizar estado del mensaje:', error);
      throw error;
    }
  }

  /**
   * Busca mensajes por contenido o tipo
   */
  async searchMessages(
    searchTerm: string,
    messageType?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'button' | 'location' | 'sticker',
    limit: number = 50
  ) {
    try {
      const whereClause: any = {
        OR: [
          { content: { contains: searchTerm, mode: 'insensitive' } },
          { contactName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      };

      if (messageType) {
        whereClause.messageType = messageType;
      }

      const messages = await this.prisma.whatsappMessage.findMany({
        where: whereClause,
        orderBy: { receivedAt: 'desc' },
        take: limit,
      });

      return messages;
    } catch (error) {
      console.error('❌ Error al buscar mensajes:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de mensajes
   */
  async getMessageStats() {
    try {
      const stats = await this.prisma.$transaction([
        // Total de mensajes
        this.prisma.whatsappMessage.count(),
        
        // Mensajes por dirección
        this.prisma.whatsappMessage.groupBy({
          by: ['direction'],
          _count: { direction: true },
          orderBy: { direction: 'asc' }
        }),
        
        // Mensajes por tipo
        this.prisma.whatsappMessage.groupBy({
          by: ['messageType'],
          _count: { messageType: true },
          orderBy: { messageType: 'asc' }
        }),
        
        // Mensajes por estado
        this.prisma.whatsappMessage.groupBy({
          by: ['status'],
          _count: { status: true },
          orderBy: { status: 'asc' }
        }),
        
        // Mensajes por día (últimos 7 días)
        this.prisma.whatsappMessage.groupBy({
          by: ['receivedAt'],
          _count: { receivedAt: true },
          orderBy: { receivedAt: 'desc' },
          where: {
            receivedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        total: stats[0],
        byDirection: stats[1],
        byType: stats[2],
        byStatus: stats[3],
        byDay: stats[4],
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Limpia mensajes antiguos (opcional, para mantenimiento)
   */
  async cleanupOldMessages(daysOld: number = 365) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await this.prisma.whatsappMessage.deleteMany({
        where: {
          receivedAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`🧹 ${result.count} mensajes antiguos eliminados (más de ${daysOld} días)`);
      return result;
    } catch (error) {
      console.error('❌ Error al limpiar mensajes antiguos:', error);
      throw error;
    }
  }
}
