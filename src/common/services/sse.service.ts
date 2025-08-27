import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsAppMessageEvent, WhatsAppStatusEvent } from './whatsapp-event-emitter.service';

export interface AdminConnection {
  id: string;
  email: string;
  response: any; // Response object para SSE
  isActive: boolean;
  connectedAt: Date;
  lastActivity: Date;
}

export interface PendingMessage {
  messageId: string;
  data: WhatsAppMessageEvent;
  timestamp: Date;
  attempts: number;
}

@Injectable()
export class SSEService implements OnModuleInit, OnModuleDestroy {
  private adminConnections: Map<string, AdminConnection> = new Map();
  private pendingMessages: PendingMessage[] = [];
  private readonly MAX_PENDING_MESSAGES = 1000;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 5000; // 5 segundos

  constructor(private readonly eventEmitter: EventEmitter2) {}

  onModuleInit() {
    this.setupEventListeners();
    this.startCleanupInterval();
  }

  onModuleDestroy() {
    this.cleanupAllConnections();
  }

  /**
   * Configura los listeners de eventos de WhatsApp
   */
  private setupEventListeners(): void {
    // Escuchar nuevos mensajes
    this.eventEmitter.on('whatsapp.message.received', (messageEvent: WhatsAppMessageEvent) => {
      this.handleNewMessage(messageEvent);
    });

    // Escuchar cambios de estado
    this.eventEmitter.on('whatsapp.message.status', (statusEvent: WhatsAppStatusEvent) => {
      this.handleMessageStatus(statusEvent);
    });

    // Escuchar conexiones de administradores
    this.eventEmitter.on('whatsapp.admin.connected', (data: { adminId: string; adminEmail: string }) => {
      console.log(`👤 Admin conectado via SSE: ${data.adminEmail}`);
    });

    // Escuchar desconexiones de administradores
    this.eventEmitter.on('whatsapp.admin.disconnected', (data: { adminId: string; adminEmail: string }) => {
      console.log(`👤 Admin desconectado via SSE: ${data.adminEmail}`);
    });
  }

  /**
   * Registra una nueva conexión SSE de administrador
   */
  registerAdminConnection(adminId: string, adminEmail: string, response: any): void {
    try {
      // Configurar headers SSE
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Accel-Buffering': 'no', // Deshabilitar buffering en nginx
      });

      // Enviar mensaje de conexión
      this.sendSSEMessage(response, 'connected', { 
        message: 'Conexión SSE establecida',
        adminId,
        adminEmail,
        timestamp: new Date()
      });

      // Registrar conexión
      const connection: AdminConnection = {
        id: adminId,
        email: adminEmail,
        response,
        isActive: true,
        connectedAt: new Date(),
        lastActivity: new Date(),
      };

      this.adminConnections.set(adminId, connection);
      console.log(`🔗 Conexión SSE registrada para admin: ${adminEmail}`);

      // Enviar mensajes pendientes si los hay
      this.sendPendingMessagesToAdmin(adminId);

      // Configurar manejo de desconexión
      response.on('close', () => {
        console.log(`🔌 Conexión SSE cerrada para admin: ${adminEmail}`);
        this.removeAdminConnection(adminId);
      });

      response.on('error', (error) => {
        console.error(`❌ Error en conexión SSE de admin ${adminEmail}:`, error);
        this.removeAdminConnection(adminId);
      });

      // Configurar heartbeat para mantener la conexión viva
      this.setupHeartbeat(adminId, response);

      // Configurar timeout de inactividad más largo
      this.setupInactivityTimeout(adminId);

    } catch (error) {
      console.error('❌ Error al registrar conexión SSE:', error);
    }
  }

  /**
   * Configura el heartbeat para mantener la conexión viva
   */
  private setupHeartbeat(adminId: string, response: any): void {
    const heartbeatInterval = setInterval(() => {
      try {
        const connection = this.adminConnections.get(adminId);
        if (connection && connection.isActive) {
          // Enviar comentario de heartbeat (no es un evento, solo mantiene la conexión viva)
          response.write(': heartbeat\n\n');
          connection.lastActivity = new Date();
        } else {
          clearInterval(heartbeatInterval);
        }
      } catch (error) {
        console.error(`❌ Error en heartbeat para admin ${adminId}:`, error);
        clearInterval(heartbeatInterval);
      }
    }, 25000); // Cada 25 segundos (antes de que expire el timeout del servidor)

    // Guardar el intervalo para poder limpiarlo después
    const connection = this.adminConnections.get(adminId);
    if (connection) {
      (connection as any).heartbeatInterval = heartbeatInterval;
    }
  }

  /**
   * Configura el timeout de inactividad
   */
  private setupInactivityTimeout(adminId: string): void {
    const timeout = setTimeout(() => {
      const connection = this.adminConnections.get(adminId);
      if (connection && connection.isActive) {
        console.log(`⏰ Timeout de inactividad para admin: ${connection.email}`);
        this.removeAdminConnection(adminId);
      }
    }, 10 * 60 * 1000); // 10 minutos de inactividad

    // Guardar el timeout para poder limpiarlo después
    const connection = this.adminConnections.get(adminId);
    if (connection) {
      (connection as any).inactivityTimeout = timeout;
    }
  }

  /**
   * Remueve una conexión de administrador
   */
  private removeAdminConnection(adminId: string): void {
    const connection = this.adminConnections.get(adminId);
    if (connection) {
      // Limpiar intervalos y timeouts
      if ((connection as any).heartbeatInterval) {
        clearInterval((connection as any).heartbeatInterval);
      }
      if ((connection as any).inactivityTimeout) {
        clearTimeout((connection as any).inactivityTimeout);
      }

      connection.isActive = false;
      this.adminConnections.delete(adminId);
      console.log(`🔌 Conexión SSE removida para admin: ${connection.email}`);
      
      // Emitir evento de desconexión
      this.eventEmitter.emit('whatsapp.admin.disconnected', {
        adminId,
        adminEmail: connection.email,
        timestamp: new Date()
      });
    }
  }

  /**
   * Maneja un nuevo mensaje de WhatsApp
   */
  private handleNewMessage(messageEvent: WhatsAppMessageEvent): void {
    try {
      console.log(`📨 Procesando nuevo mensaje para SSE: ${messageEvent.messageId}`);
      
      // Enviar a todos los administradores conectados
      let sentToAnyAdmin = false;
      
      for (const [adminId, connection] of Array.from(this.adminConnections.entries())) {
        if (connection.isActive) {
          try {
            this.sendSSEMessage(connection.response, 'new_message', {
              type: 'whatsapp_message',
              data: messageEvent,
              timestamp: new Date()
            });
            
            connection.lastActivity = new Date();
            sentToAnyAdmin = true;
            
          } catch (error) {
            console.error(`❌ Error enviando mensaje a admin ${connection.email}:`, error);
            connection.isActive = false;
          }
        }
      }

      // Si no hay administradores conectados, guardar mensaje pendiente
      if (!sentToAnyAdmin) {
        this.addPendingMessage(messageEvent);
      }

    } catch (error) {
      console.error('❌ Error manejando nuevo mensaje para SSE:', error);
    }
  }

  /**
   * Maneja cambios de estado de mensajes
   */
  private handleMessageStatus(statusEvent: WhatsAppStatusEvent): void {
    try {
      for (const [adminId, connection] of Array.from(this.adminConnections.entries())) {
        if (connection.isActive) {
          try {
            this.sendSSEMessage(connection.response, 'message_status', {
              type: 'whatsapp_status',
              data: statusEvent,
              timestamp: new Date()
            });
            
            connection.lastActivity = new Date();
            
          } catch (error) {
            console.error(`❌ Error enviando estado a admin ${connection.email}:`, error);
            connection.isActive = false;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error manejando estado de mensaje para SSE:', error);
    }
  }

  /**
   * Envía un mensaje SSE
   */
  private sendSSEMessage(response: any, event: string, data: any): void {
    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      response.write(message);
    } catch (error) {
      console.error('❌ Error enviando mensaje SSE:', error);
    }
  }

  /**
   * Agrega un mensaje a la cola de pendientes
   */
  private addPendingMessage(messageEvent: WhatsAppMessageEvent): void {
    try {
      const pendingMessage: PendingMessage = {
        messageId: messageEvent.messageId,
        data: messageEvent,
        timestamp: new Date(),
        attempts: 0,
      };

      this.pendingMessages.push(pendingMessage);

      // Mantener solo los últimos mensajes
      if (this.pendingMessages.length > this.MAX_PENDING_MESSAGES) {
        this.pendingMessages.shift();
      }

      console.log(`📋 Mensaje agregado a pendientes: ${messageEvent.messageId}`);
    } catch (error) {
      console.error('❌ Error agregando mensaje pendiente:', error);
    }
  }

  /**
   * Envía mensajes pendientes a un administrador recién conectado
   */
  private sendPendingMessagesToAdmin(adminId: string): void {
    try {
      const connection = this.adminConnections.get(adminId);
      if (!connection || !connection.isActive) return;

      const recentMessages = this.pendingMessages
        .filter(msg => msg.attempts < this.MAX_RETRY_ATTEMPTS)
        .slice(-50); // Enviar solo los últimos 50 mensajes

      if (recentMessages.length > 0) {
        console.log(`📤 Enviando ${recentMessages.length} mensajes pendientes a admin: ${connection.email}`);
        
        for (const pendingMsg of recentMessages) {
          try {
            this.sendSSEMessage(connection.response, 'pending_message', {
              type: 'whatsapp_pending',
              data: pendingMsg.data,
              timestamp: new Date()
            });
            
            pendingMsg.attempts++;
            
          } catch (error) {
            console.error(`❌ Error enviando mensaje pendiente:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error enviando mensajes pendientes:', error);
    }
  }

  /**
   * Inicia el intervalo de limpieza
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupInactiveConnections();
      this.cleanupOldPendingMessages();
    }, 30000); // Cada 30 segundos
  }

  /**
   * Limpia conexiones inactivas
   */
  private cleanupInactiveConnections(): void {
    const now = new Date();
    const timeout = 10 * 60 * 1000; // 10 minutos (coincide con setupInactivityTimeout)

    for (const [adminId, connection] of Array.from(this.adminConnections.entries())) {
      if (now.getTime() - connection.lastActivity.getTime() > timeout) {
        console.log(`🧹 Limpiando conexión inactiva de admin: ${connection.email}`);
        this.removeAdminConnection(adminId);
      }
    }
  }

  /**
   * Limpia mensajes pendientes antiguos
   */
  private cleanupOldPendingMessages(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    this.pendingMessages = this.pendingMessages.filter(msg => 
      now.getTime() - msg.timestamp.getTime() < maxAge
    );
  }

  /**
   * Limpia todas las conexiones
   */
  private cleanupAllConnections(): void {
    for (const [adminId, connection] of Array.from(this.adminConnections.entries())) {
      try {
        connection.response.end();
      } catch (error) {
        // Ignorar errores de conexión cerrada
      }
    }
    this.adminConnections.clear();
  }

  /**
   * Obtiene estadísticas de conexiones
   */
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    pendingMessages: number;
  } {
    const totalConnections = this.adminConnections.size;
    const activeConnections = Array.from(this.adminConnections.values())
      .filter(conn => conn.isActive).length;

    return {
      totalConnections,
      activeConnections,
      pendingMessages: this.pendingMessages.length,
    };
  }

  /**
   * Verifica si un administrador está conectado
   */
  isAdminConnected(adminId: string): boolean {
    const connection = this.adminConnections.get(adminId);
    return connection?.isActive || false;
  }
}
