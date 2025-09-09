import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SettingCategory } from 'src/common/dtos/inputs/setting.input.dto';
import { SettingsService } from './settings.service';

export interface MessageCountResult {
  success: boolean;
  remainingCount: number;
  decrementedAmount: number;
  isUnlimited: boolean;
}

@Injectable()
export class MessageCounterService {
  private readonly logger = new Logger(MessageCounterService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Verifica y decrementa el contador de mensajes de forma segura
   * @param category Categoría del setting
   * @param amount Cantidad a decrementar
   * @returns Resultado de la operación
   */
  async verifyAndDecrementMessages(
    category: SettingCategory,
    amount: number,
  ): Promise<MessageCountResult> {
    try {
      // Verificar disponibilidad antes de decrementar
      const hasEnough = await this.settingsService.hasEnoughMessages(category, amount);

      if (!hasEnough) {
        const available = await this.settingsService.getMessageCount(category);
        throw new BadRequestException(
          `No hay suficientes mensajes disponibles. Disponibles: ${available}, Solicitados: ${amount}`,
        );
      }

      // Decrementar de forma atómica
      const updatedSetting = await this.settingsService.decrementMessageCountBatch(
        category,
        amount,
      );

      if (!updatedSetting) {
        throw new BadRequestException('Error al actualizar el contador de mensajes');
      }

      return {
        success: true,
        remainingCount: updatedSetting.count,
        decrementedAmount: amount,
        isUnlimited: updatedSetting.count === -99,
      };
    } catch (error) {
      this.logger.error(`Error al verificar/decrementar mensajes: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verifica si hay suficientes mensajes sin decrementar
   * @param category Categoría del setting
   * @param amount Cantidad a verificar
   * @returns true si hay suficientes mensajes
   */
  async checkMessageAvailability(category: SettingCategory, amount: number): Promise<boolean> {
    return this.settingsService.hasEnoughMessages(category, amount);
  }

  /**
   * Obtiene el contador actual de mensajes
   * @param category Categoría del setting
   * @returns Cantidad de mensajes restantes
   */
  async getCurrentMessageCount(category: SettingCategory): Promise<number> {
    return this.settingsService.getMessageCount(category);
  }

  /**
   * Procesa múltiples decrementos de forma eficiente
   * @param category Categoría del setting
   * @param decrements Array de cantidades a decrementar
   * @returns Resultado de la operación
   */
  async processBatchDecrements(
    category: SettingCategory,
    decrements: number[],
  ): Promise<MessageCountResult> {
    const totalAmount = decrements.reduce((sum, amount) => sum + amount, 0);

    try {
      // Verificar disponibilidad total
      const hasEnough = await this.settingsService.hasEnoughMessages(category, totalAmount);

      if (!hasEnough) {
        const available = await this.settingsService.getMessageCount(category);
        throw new BadRequestException(
          `No hay suficientes mensajes para el lote. Disponibles: ${available}, Solicitados: ${totalAmount}`,
        );
      }

      // Decrementar todo en una sola operación atómica
      const updatedSetting = await this.settingsService.decrementMessageCountBatch(
        category,
        totalAmount,
      );

      if (!updatedSetting) {
        throw new BadRequestException('Error al actualizar el contador de mensajes');
      }

      return {
        success: true,
        remainingCount: updatedSetting.count,
        decrementedAmount: totalAmount,
        isUnlimited: updatedSetting.count === -99,
      };
    } catch (error) {
      this.logger.error(`Error al procesar decrementos en lote: ${error.message}`, error.stack);
      throw error;
    }
  }
}
