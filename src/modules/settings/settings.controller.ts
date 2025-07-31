import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/Auth/firebase-auth.guard';
import { CreateSettingDto, SettingCategory, UpdateSettingDto } from 'src/common/dtos/inputs/setting.input.dto';
import { SettingsService } from './settings.service';

class SettingResponseDto {
  @ApiProperty({ example: 'ckl1q2w3e0000a1b2c3d4e5f6', description: 'ID único del setting' })
  id: string;

  @ApiProperty({ example: 'WHATSAPP', enum: SettingCategory, description: 'Categoría del setting' })
  category: SettingCategory;

  @ApiProperty({
    example: '{"token":"abc123","apiVersion":"v18.0","wabaId":"1234567890","cellphoneNumberId":"987654321","isActive":true}',
    description: 'Configuración en formato JSON string (ver modelo WhatsappConfig en frontend)'
  })
  jsonSettings: string;

  @ApiProperty({ 
    example: 1000, 
    description: 'Cantidad de mensajes restantes (-99 = ilimitado, >= 0 = cantidad específica)',
    minimum: -99
  })
  count: number;

  @ApiProperty({ example: '2024-07-24T05:22:58.000Z', description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ example: '2024-07-24T05:22:58.000Z', description: 'Fecha de última actualización' })
  updatedAt: Date;
}

@ApiTags('settings')
@Controller('settings')
@UseGuards(FirebaseAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Crea o actualiza la configuración de settings para una categoría.
   * Si ya existe un registro para la categoría, lo actualiza; si no, lo crea.
   * @param createSettingDto Datos para crear o actualizar el setting
   */
  @Post()
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Crear o actualizar un setting', description: 'Crea una configuración para una categoría específica. Si ya existe, la actualiza.' })
  @ApiBody({
    type: 'object',
    description: 'Datos para crear o actualizar el setting',
    examples: {
      whatsapp: {
        summary: 'Ejemplo WhatsApp',
        value: {
          category: 'WHATSAPP',
          jsonSettings: '{"token":"abc123","apiVersion":"v18.0","wabaId":"1234567890","cellphoneNumberId":"987654321","isActive":true}',
          count: 1000
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Setting creado o actualizado exitosamente', type: SettingResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  /**
   * Obtiene la configuración de una categoría específica.
   * @param category Categoría del setting
   */
  @Get(':category')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Obtener setting por categoría', description: 'Obtiene la configuración de una categoría específica.' })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiResponse({
    status: 200,
    description: 'Configuración encontrada',
    type: SettingResponseDto,
    examples: {
      whatsapp: {
        summary: 'Ejemplo WhatsApp',
                  value: {
            id: 'ckl1q2w3e0000a1b2c3d4e5f6',
            category: 'WHATSAPP',
            jsonSettings: '{"token":"abc123","apiVersion":"v18.0","wabaId":"1234567890","cellphoneNumberId":"987654321","isActive":true}',
            count: 1000,
            createdAt: '2024-07-24T05:22:58.000Z',
            updatedAt: '2024-07-24T05:22:58.000Z'
          }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  findByCategory(@Param('category') category: SettingCategory) {
    return this.settingsService.findByCategory(category);
  }

  /**
   * Actualiza la configuración de una categoría específica.
   * @param category Categoría del setting
   * @param updateSettingDto Datos a actualizar
   */
  @Patch(':category')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Actualizar setting por categoría', description: 'Actualiza la configuración de una categoría específica.' })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiBody({
    type: 'object',
    description: 'Datos a actualizar',
    examples: {
      whatsapp: {
        summary: 'Ejemplo actualización WhatsApp',
        value: {
          jsonSettings: '{"token":"nuevoToken","apiVersion":"v18.0","wabaId":"1234567890","cellphoneNumberId":"987654321","isActive":true}',
          count: 950
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Setting actualizado', type: SettingResponseDto })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  updateByCategory(
    @Param('category') category: SettingCategory,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    return this.settingsService.updateByCategory(category, updateSettingDto);
  }

  /**
   * Elimina la configuración de una categoría específica.
   * @param category Categoría del setting
   */
  @Delete(':category')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Eliminar setting por categoría', description: 'Elimina la configuración de una categoría específica.' })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiResponse({ status: 200, description: 'Setting eliminado', type: SettingResponseDto })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  removeByCategory(@Param('category') category: SettingCategory) {
    return this.settingsService.removeByCategory(category);
  }

  /**
   * Decrementa el contador de mensajes restantes
   * @param category Categoría del setting
   * @param amount Cantidad a decrementar (por defecto 1)
   */
  @Post(':category/decrement-messages')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ 
    summary: 'Decrementar contador de mensajes', 
    description: 'Decrementa el contador de mensajes restantes. Si es -99 (ilimitado), no se decrementa.' 
  })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiBody({
    type: 'object',
    description: 'Cantidad a decrementar',
    examples: {
      default: {
        summary: 'Decrementar 1 mensaje',
        value: { amount: 1 }
      },
      multiple: {
        summary: 'Decrementar múltiples mensajes',
        value: { amount: 5 }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Contador decrementado', type: SettingResponseDto })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  decrementMessageCount(
    @Param('category') category: SettingCategory,
    @Body() body: { amount?: number }
  ) {
    return this.settingsService.decrementMessageCount(category, body.amount || 1);
  }

  /**
   * Obtiene el contador de mensajes restantes
   * @param category Categoría del setting
   */
  @Get(':category/message-count')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ 
    summary: 'Obtener contador de mensajes', 
    description: 'Obtiene el contador de mensajes restantes para una categoría específica.' 
  })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contador de mensajes',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Cantidad de mensajes restantes (-99 = ilimitado)',
          example: 1000
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  getMessageCount(@Param('category') category: SettingCategory) {
    return this.settingsService.getMessageCount(category);
  }

  /**
   * Decrementa el contador de mensajes en lote
   * @param category Categoría del setting
   * @param amount Cantidad total a decrementar
   */
  @Post(':category/decrement-messages-batch')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ 
    summary: 'Decrementar contador de mensajes en lote', 
    description: 'Decrementa el contador de mensajes restantes en una sola operación atómica. Más eficiente para múltiples mensajes.' 
  })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiBody({
    type: 'object',
    description: 'Cantidad total a decrementar',
    examples: {
      batch: {
        summary: 'Decrementar múltiples mensajes',
        value: { amount: 1000 }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Contador decrementado en lote', type: SettingResponseDto })
  @ApiResponse({ status: 400, description: 'No hay suficientes mensajes disponibles' })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  decrementMessageCountBatch(
    @Param('category') category: SettingCategory,
    @Body() body: { amount: number }
  ) {
    return this.settingsService.decrementMessageCountBatch(category, body.amount);
  }

  /**
   * Verifica si hay suficientes mensajes disponibles
   * @param category Categoría del setting
   * @param amount Cantidad a verificar
   */
  @Post(':category/check-messages')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ 
    summary: 'Verificar disponibilidad de mensajes', 
    description: 'Verifica si hay suficientes mensajes disponibles sin decrementar el contador.' 
  })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiBody({
    type: 'object',
    description: 'Cantidad a verificar',
    examples: {
      check: {
        summary: 'Verificar disponibilidad',
        value: { amount: 1000 }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado de la verificación',
    schema: {
      type: 'object',
      properties: {
        hasEnough: {
          type: 'boolean',
          description: 'Si hay suficientes mensajes disponibles',
          example: true
        },
        available: {
          type: 'number',
          description: 'Cantidad de mensajes disponibles',
          example: 15000
        },
        requested: {
          type: 'number',
          description: 'Cantidad solicitada',
          example: 1000
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  async checkMessages(
    @Param('category') category: SettingCategory,
    @Body() body: { amount: number }
  ) {
    const hasEnough = await this.settingsService.hasEnoughMessages(category, body.amount);
    const available = await this.settingsService.getMessageCount(category);
    
    return {
      hasEnough,
      available,
      requested: body.amount
    };
  }

  /**
   * Incrementa el contador de mensajes (para rollback)
   * @param category Categoría del setting
   * @param amount Cantidad a incrementar
   */
  @Post(':category/increment-messages')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ 
    summary: 'Incrementar contador de mensajes (Rollback)', 
    description: 'Incrementa el contador de mensajes restantes. Usado para rollback cuando fallan envíos.' 
  })
  @ApiParam({ name: 'category', enum: SettingCategory, description: 'Categoría del setting', example: 'WHATSAPP' })
  @ApiBody({
    type: 'object',
    description: 'Cantidad a incrementar',
    examples: {
      rollback: {
        summary: 'Rollback de mensajes fallidos',
        value: { amount: 50 }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Contador incrementado', type: SettingResponseDto })
  @ApiResponse({ status: 404, description: 'Setting no encontrado' })
  incrementMessageCount(
    @Param('category') category: SettingCategory,
    @Body() body: { amount: number }
  ) {
    return this.settingsService.incrementMessageCount(category, body.amount);
  }
} 