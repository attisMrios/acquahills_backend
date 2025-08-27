import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WhatsAppMessageService } from './whatsapp-message.service';

@ApiTags('WhatsApp Messages')
@Controller('whatsapp-messages')
export class WhatsAppMessagesController {
  constructor(private readonly messageService: WhatsAppMessageService) {}

  @Get('contact/:waId')
  @ApiOperation({ summary: 'Obtener historial de mensajes de un contacto' })
  @ApiParam({ name: 'waId', description: 'ID de WhatsApp del contacto' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de mensajes (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de mensajes a omitir (default: 0)' })
  @ApiResponse({ status: 200, description: 'Historial de mensajes del contacto' })
  async getContactHistory(
    @Param('waId') waId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    try {
      const messages = await this.messageService.getContactHistory(waId, limit, offset);
      
      return {
        success: true,
        data: {
          waId,
          messages,
          pagination: {
            limit,
            offset,
            total: messages.length
          }
        }
      };
    } catch (error) {
      console.error('Error al obtener historial del contacto:', error);
      return {
        success: false,
        message: 'Error al obtener historial del contacto',
        error: error.message
      };
    }
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Obtener mensajes de una conversación específica' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversación' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de mensajes (default: 100)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de mensajes a omitir (default: 0)' })
  @ApiResponse({ status: 200, description: 'Mensajes de la conversación' })
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0
  ) {
    try {
      const messages = await this.messageService.getConversationMessages(conversationId, limit, offset);
      
      return {
        success: true,
        data: {
          conversationId,
          messages,
          pagination: {
            limit,
            offset,
            total: messages.length
          }
        }
      };
    } catch (error) {
      console.error('Error al obtener mensajes de conversación:', error);
      return {
        success: false,
        message: 'Error al obtener mensajes de conversación',
        error: error.message
      };
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar mensajes por contenido o tipo' })
  @ApiQuery({ name: 'q', required: true, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo de mensaje específico' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de resultados (default: 50)' })
  @ApiResponse({ status: 200, description: 'Mensajes que coinciden con la búsqueda' })
  async searchMessages(
    @Query('q') searchTerm: string,
    @Query('type') messageType?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'button' | 'location' | 'sticker',
    @Query('limit') limit: number = 50
  ) {
    try {
      const messages = await this.messageService.searchMessages(searchTerm, messageType, limit);
      
      return {
        success: true,
        data: {
          searchTerm,
          messageType,
          messages,
          total: messages.length
        }
      };
    } catch (error) {
      console.error('Error al buscar mensajes:', error);
      return {
        success: false,
        message: 'Error al buscar mensajes',
        error: error.message
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de mensajes' })
  @ApiResponse({ status: 200, description: 'Estadísticas generales de mensajes' })
  async getMessageStats() {
    try {
      const stats = await this.messageService.getMessageStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      };
    }
  }

  @Get('recent')
  @ApiOperation({ summary: 'Obtener mensajes recientes' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de mensajes (default: 20)' })
  @ApiResponse({ status: 200, description: 'Mensajes más recientes' })
  async getRecentMessages(@Query('limit') limit: number = 20) {
    try {
      // Obtener mensajes recientes usando el servicio
      const messages = await this.messageService.getContactHistory('', limit, 0);
      
      return {
        success: true,
        data: {
          messages,
          total: messages.length
        }
      };
    } catch (error) {
      console.error('Error al obtener mensajes recientes:', error);
      return {
        success: false,
        message: 'Error al obtener mensajes recientes',
        error: error.message
      };
    }
  }
}
