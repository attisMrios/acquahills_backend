import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { WhatsappWebhookDto } from "./dtos/whatsapp-webhook.dto";
import { WhatsappService } from "./whatsapp.service";

@ApiTags('Whatsapp')
@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly whatsappService: WhatsappService) { }

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
            console.log('🔐 Verificación de webhook:', { verifyToken, expectedToken: process.env.WABA_VERIFY_TOKEN });
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
    async Webhook(
        @Body() body: WhatsappWebhookDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            // Log seguro del webhook sin causar errores de estructura circular
            console.log('📱 Webhook recibido de WhatsApp');
            console.log('📊 Tipo de entrada:', body.entry?.length || 0, 'entradas');
            
            if (body.entry && body.entry.length > 0) {
                body.entry.forEach((entry, index) => {
                    console.log(`📝 Entrada ${index + 1}:`, {
                        id: entry.id,
                        changes: entry.changes?.length || 0
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
}
