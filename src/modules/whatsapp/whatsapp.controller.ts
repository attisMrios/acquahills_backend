import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
    ConversationFiltersSchema,
    ConversationsResponseDto,
    ConversationsWithFiltersResponseDto
} from './dtos/conversation.schema';
import { WhatsappWebhookDto } from './dtos/whatsapp-webhook.dto';
import { WhatsappService } from './whatsapp.service';

@ApiTags('Whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get()
  @ApiQuery({ name: 'hub.mode', required: true })
  @ApiQuery({ name: 'hub.challenge', required: true })
  @ApiQuery({ name: 'hub.verify_token', required: true })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWhatsapp(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (mode === 'subscribe') {
      console.log('🔐 Verificación de webhook:', {
        verifyToken,
        expectedToken: process.env.WABA_VERIFY_TOKEN,
      });
      if (verifyToken === process.env.WABA_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.status(401).send('Unauthorized');
      }
    } else {
      return res.status(401).send('Unauthorized');
    }
  }

  @Post()
  @ApiBody({ description: 'Payload from WhatsApp', type: Object })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async Webhook(@Body() body: WhatsappWebhookDto, @Res({ passthrough: true }) res: Response) {
    try {
      // Log seguro del webhook sin causar errores de estructura circular
      console.log('📱 Webhook recibido de WhatsApp');
      console.log('📊 Tipo de entrada:', body.entry?.length || 0, 'entradas');

      if (body.entry && body.entry.length > 0) {
        body.entry.forEach((entry, index) => {
          console.log(`📝 Entrada ${index + 1}:`, {
            id: entry.id,
            changes: entry.changes?.length || 0,
          });
        });
      }

      // Procesar el webhook
      await this.whatsappService.handleWebhook(body);

      return res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Error en webhook de WhatsApp:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  @Post('send-text-message')
  @ApiBody({ description: 'Payload from WhatsApp', type: Object })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTextMessage(
    @Body() body: { message: string; phoneNumber: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { message, phoneNumber } = body;
      const response = await this.whatsappService.sendTextMessage(message, phoneNumber);
      return res.status(200).send(response);
    } catch (error) {
      console.error('❌ Error en webhook de WhatsApp:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  @Get('get-conversations')
  @ApiResponse({
    status: 200,
    description: 'Lista de conversaciones únicas obtenida exitosamente',
    type: ConversationsResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getConversations(@Res({ passthrough: true }) res: Response) {
    try {
      const response = await this.whatsappService.getConversations();

      if (response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(500).json(response);
      }
    } catch (error) {
      console.error('❌ Error en endpoint getConversations:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        data: [],
        total: 0,
      });
    }
  }

  @Get('get-conversations-filtered')
  @ApiResponse({
    status: 200,
    description: 'Lista de conversaciones filtradas obtenida exitosamente',
    type: ConversationsWithFiltersResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getConversationsWithFilters(
    @Query() filters: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Validar parámetros con Zod
      const validationResult = ConversationFiltersSchema.safeParse(filters);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros de consulta inválidos',
          details: validationResult.error.errors,
          data: [],
          total: 0,
          pagination: {
            limit: 0,
            offset: 0,
            hasMore: false,
          },
        });
      }

      const validatedFilters = validationResult.data;
      const response = await this.whatsappService.getConversationsWithFilters(validatedFilters);

      if (response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(500).json(response);
      }
    } catch (error) {
      console.error('❌ Error en endpoint getConversationsWithFilters:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        data: [],
        total: 0,
        pagination: {
          limit: 0,
          offset: 0,
          hasMore: false,
        },
      });
    }
  }
}
