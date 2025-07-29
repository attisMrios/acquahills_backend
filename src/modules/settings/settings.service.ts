import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateSettingDto, UpdateSettingDto, SettingCategory, CreateSettingSchema, UpdateSettingSchema } from 'src/common/dtos/inputs/setting.input.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSettingDto: CreateSettingDto) {
    const parsed = CreateSettingSchema.safeParse(createSettingDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    // Verificar si ya existe un registro para la categoría
    const existing = await this.prisma.setting.findFirst({ where: { category: parsed.data.category } });
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
} 