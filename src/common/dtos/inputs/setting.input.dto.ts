import { z } from 'zod';

export enum SettingCategory {
  WHATSAPP = 'WHATSAPP',
}

export const CreateSettingSchema = z.object({
  category: z.nativeEnum(SettingCategory),
  jsonSettings: z.string(),
  count: z.number().int().min(-99).default(0), // -99 = ilimitado, >= 0 = cantidad específica
});

export const UpdateSettingSchema = z.object({
  jsonSettings: z.string().optional(),
  count: z.number().int().min(-99).optional(), // -99 = ilimitado, >= 0 = cantidad específica
});

export type CreateSettingDto = z.infer<typeof CreateSettingSchema>;
export type UpdateSettingDto = z.infer<typeof UpdateSettingSchema>;
