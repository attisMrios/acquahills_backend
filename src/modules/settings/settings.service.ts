import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateSettingDto,
  CreateSettingSchema,
  SettingCategory,
  UpdateSettingDto,
  UpdateSettingSchema,
} from 'src/common/dtos/inputs/setting.input.dto';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSettingDto: CreateSettingDto) {
    const parsed = CreateSettingSchema.safeParse(createSettingDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    // Verificar si ya existe un registro para la categoría
    const existing = await this.prisma.setting.findFirst({
      where: { category: parsed.data.category },
    });
    if (existing) {
      // Si existe, actualizarlo
      return this.prisma.setting.update({
        where: { id: existing.id },
        data: parsed.data,
      });
    }
    // Si no existe, crearlo
    return this.prisma.setting.create({ data: parsed.data });
  }

  async findByCategory(category: SettingCategory) {
    const setting = await this.prisma.setting.findFirst({ where: { category } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async updateByCategory(category: SettingCategory, updateSettingDto: UpdateSettingDto) {
    const parsed = UpdateSettingSchema.safeParse(updateSettingDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    const setting = await this.prisma.setting.findFirst({ where: { category } });
    if (!setting) throw new NotFoundException('Setting not found');
    return this.prisma.setting.update({
      where: { id: setting.id },
      data: parsed.data,
    });
  }

  async removeByCategory(category: SettingCategory) {
    const setting = await this.prisma.setting.findFirst({ where: { category } });
    if (!setting) throw new NotFoundException('Setting not found');
    return this.prisma.setting.delete({ where: { id: setting.id } });
  }

  /**
   * Decrementa el contador de mensajes restantes de forma atómica
   * @param category Categoría del setting
   * @param amount Cantidad a decrementar (por defecto 1)
   * @returns El setting actualizado
   */
  async decrementMessageCount(category: SettingCategory, amount: number = 1) {
    return this.prisma.$transaction(
      async (tx) => {
        // Usar FOR UPDATE para bloquear la fila durante la transacción
        const setting = await tx.setting.findFirst({
          where: { category },
          select: { id: true, count: true },
        });

        if (!setting) throw new NotFoundException('Setting not found');

        // Si el contador es -99 (ilimitado), no decrementar
        if (setting.count === -99) {
          return await tx.setting.findUnique({ where: { id: setting.id } });
        }

        // Verificar si hay suficientes mensajes disponibles
        if (setting.count < amount) {
          throw new BadRequestException(
            `No hay suficientes mensajes disponibles. Disponibles: ${setting.count}, Solicitados: ${amount}`,
          );
        }

        // Calcular el nuevo contador
        const newCount = setting.count - amount;

        // Actualizar el contador de forma atómica
        return await tx.setting.update({
          where: { id: setting.id },
          data: { count: newCount },
        });
      },
      {
        isolationLevel: 'Serializable', // Nivel más alto de aislamiento para prevenir condiciones de carrera
        maxWait: 5000, // Esperar máximo 5 segundos por el lock
        timeout: 10000, // Timeout total de 10 segundos
      },
    );
  }

  /**
   * Obtiene el contador de mensajes restantes
   * @param category Categoría del setting
   * @returns El contador de mensajes
   */
  async getMessageCount(category: SettingCategory): Promise<number> {
    const setting = await this.prisma.setting.findFirst({ where: { category } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting.count;
  }

  /**
   * Decrementa el contador de mensajes en lote de forma atómica
   * Más eficiente para múltiples decrementos simultáneos
   * @param category Categoría del setting
   * @param amount Cantidad total a decrementar
   * @returns El setting actualizado
   */
  async decrementMessageCountBatch(category: SettingCategory, amount: number) {
    return this.prisma.$transaction(
      async (tx) => {
        // Usar FOR UPDATE para bloquear la fila durante la transacción
        const setting = await tx.setting.findFirst({
          where: { category },
          select: { id: true, count: true },
        });

        if (!setting) throw new NotFoundException('Setting not found');

        // Si el contador es -99 (ilimitado), no decrementar
        if (setting.count === -99) {
          return await tx.setting.findUnique({ where: { id: setting.id } });
        }

        // Verificar si hay suficientes mensajes disponibles
        if (setting.count < amount) {
          throw new BadRequestException(
            `No hay suficientes mensajes disponibles. Disponibles: ${setting.count}, Solicitados: ${amount}`,
          );
        }

        // Calcular el nuevo contador
        const newCount = setting.count - amount;

        // Actualizar el contador de forma atómica
        return await tx.setting.update({
          where: { id: setting.id },
          data: { count: newCount },
        });
      },
      {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  /**
   * Verifica si hay suficientes mensajes disponibles sin decrementar
   * @param category Categoría del setting
   * @param amount Cantidad a verificar
   * @returns true si hay suficientes mensajes
   */
  async hasEnoughMessages(category: SettingCategory, amount: number): Promise<boolean> {
    const setting = await this.prisma.setting.findFirst({
      where: { category },
      select: { count: true },
    });

    if (!setting) return false;

    // Si es ilimitado, siempre hay suficientes
    if (setting.count === -99) return true;

    return setting.count >= amount;
  }

  /**
   * Incrementa el contador de mensajes (para rollback)
   * @param category Categoría del setting
   * @param amount Cantidad a incrementar
   * @returns El setting actualizado
   */
  async incrementMessageCount(category: SettingCategory, amount: number) {
    return this.prisma.$transaction(
      async (tx) => {
        const setting = await tx.setting.findFirst({
          where: { category },
          select: { id: true, count: true },
        });

        if (!setting) throw new NotFoundException('Setting not found');

        // Si es ilimitado, no hacer nada
        if (setting.count === -99) {
          return await tx.setting.findUnique({ where: { id: setting.id } });
        }

        // Incrementar el contador
        const newCount = setting.count + amount;

        return await tx.setting.update({
          where: { id: setting.id },
          data: { count: newCount },
        });
      },
      {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }
}
