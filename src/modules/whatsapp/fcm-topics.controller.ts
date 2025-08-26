import { Body, Controller, Delete, Param, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseService } from 'src/common/services/firebase.service';

interface SubscribeTopicDto {
  topic: string;
  token: string;
}

interface TopicSubscriptionResponse {
  success: boolean;
  message: string;
  topic?: string;
  isSubscribed?: boolean;
}

@ApiTags('FCM Topics')
@Controller('fcm-topics')
export class FCMTopicsController {
  constructor(private readonly firebaseService: FirebaseService) {}


  @Post('subscribe')
  @ApiOperation({ summary: 'Suscribir usuario a un tópico' })
  @ApiResponse({ status: 200, description: 'Usuario suscrito exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async subscribeToTopic(
    @Body() subscribeDto: SubscribeTopicDto,
    @Request() req: any
  ): Promise<TopicSubscriptionResponse> {
    try {
      
      const response = await this.firebaseService.subscribeToTopic(
        subscribeDto.topic,
        subscribeDto.token,
        req.user.id
      );

      if (response.success) {
        return {
          success: true,
          message: 'Usuario suscrito exitosamente al tópico',
          topic: subscribeDto.topic,
          isSubscribed: true
        };
      } else {
        return {
          success: false,
          message: 'Error al suscribir usuario al tópico'
        };
      }
    } catch (error) {
      console.error('Error al suscribir usuario al tópico:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  @Delete('unsubscribe/:topic')
  @ApiOperation({ summary: 'Desuscribir usuario de un tópico' })
  @ApiResponse({ status: 200, description: 'Usuario desuscrito exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async unsubscribeFromTopic(
    @Param('topic') topic: string,
    @Request() req: any
  ): Promise<TopicSubscriptionResponse> {
    try {

      const response = await this.firebaseService.unsubscribeFromTopic(topic, req.user.token, req.user.id);

      if (response.success) {
        return {
          success: true,
          message: 'Usuario desuscrito exitosamente del tópico',
          topic: topic,
          isSubscribed: false
        };
      } else {
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error) {
      console.error('Error al desuscribir usuario del tópico:', error);
      return {
        success: false,
        message: 'Error interno del servidor: ' + error.message
      };
    }
  }
}
