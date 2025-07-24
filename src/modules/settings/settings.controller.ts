import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto, SettingCategory } from 'src/common/dtos/inputs/setting.input.dto';
import { FirebaseAuthGuard } from 'src/Auth/firebase-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';

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
          jsonSettings: '{"token":"abc123","apiVersion":"v18.0","wabaId":"1234567890","cellphoneNumberId":"987654321","isActive":true}'
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
          jsonSettings: '{"token":"nuevoToken","apiVersion":"v18.0","wabaId":"1234567890","cellphoneNumberId":"987654321","isActive":true}'
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
} 