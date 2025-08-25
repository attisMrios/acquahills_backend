import { Controller, Get, Query, Request, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SSEService } from '../../common/services/sse.service';
import { WhatsAppEventEmitterService } from '../../common/services/whatsapp-event-emitter.service';

@ApiTags('WhatsApp SSE')
@Controller('whatsapp-sse')
export class WhatsAppSSEController {
  constructor(
    private readonly sseService: SSEService,
    private readonly eventEmitter: WhatsAppEventEmitterService
  ) {}

  @Get('connect')
  @ApiOperation({ 
    summary: 'Conectar administrador a SSE para mensajes de WhatsApp en tiempo real',
    description: 'Establece una conexión Server-Sent Events para recibir mensajes de WhatsApp en tiempo real. Solo para administradores.'
  })
  @ApiQuery({ 
    name: 'adminId', 
    required: true, 
    description: 'ID único del administrador' 
  })
  @ApiQuery({ 
    name: 'adminEmail', 
    required: true, 
    description: 'Email del administrador' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conexión SSE establecida exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros faltantes o inválidos' 
  })
  async connectToSSE(
    @Query('adminId') adminId: string,
    @Query('adminEmail') adminEmail: string,
    @Res() res: Response,
    @Request() req: any
  ) {
    try {
      // Validar parámetros
      if (!adminId || !adminEmail) {
        return res.status(400).json({
          success: false,
          message: 'adminId y adminEmail son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      console.log(`🔗 Intentando conectar admin ${adminEmail} (${adminId}) a SSE`);

      // Verificar si ya está conectado
      if (this.sseService.isAdminConnected(adminId)) {
        console.log(`⚠️ Admin ${adminEmail} ya está conectado, cerrando conexión anterior`);
        // La conexión anterior se cerrará automáticamente
      }

      // Emitir evento de conexión
      this.eventEmitter.emitAdminConnected(adminId, adminEmail);

      // Registrar conexión SSE
      this.sseService.registerAdminConnection(adminId, adminEmail, res);

      // La respuesta se maneja en el SSE service
      // No hacer res.send() aquí, el SSE service se encarga

    } catch (error) {
      console.error('❌ Error estableciendo conexión SSE:', error);
      
      // Solo enviar error si la respuesta no se ha enviado aún
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message
        });
      }
    }
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de conexiones SSE',
    description: 'Retorna información sobre conexiones activas y mensajes pendientes'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de conexiones SSE' 
  })
  async getSSEStats() {
    try {
      const stats = this.sseService.getConnectionStats();
      
      return {
        success: true,
        data: {
          ...stats,
          timestamp: new Date(),
          description: 'Estadísticas de conexiones SSE para WhatsApp'
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas SSE:', error);
      return {
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      };
    }
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Verificar estado del servicio SSE',
    description: 'Endpoint de salud para verificar que el servicio SSE esté funcionando'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Servicio SSE funcionando correctamente' 
  })
  async getSSEHealth() {
    try {
      const stats = this.sseService.getConnectionStats();
      
      return {
        success: true,
        status: 'healthy',
        timestamp: new Date(),
        service: 'WhatsApp SSE Service',
        connections: {
          active: stats.activeConnections,
          total: stats.totalConnections
        },
        messages: {
          pending: stats.pendingMessages
        }
      };
    } catch (error) {
      console.error('❌ Error en health check SSE:', error);
      return {
        success: false,
        status: 'unhealthy',
        timestamp: new Date(),
        service: 'WhatsApp SSE Service',
        error: error.message
      };
    }
  }
}
