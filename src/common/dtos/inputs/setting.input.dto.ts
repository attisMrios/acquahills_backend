import { z } from 'zod';

export enum SettingCategory {
  WHATSAPP = 'WHATSAPP'
}

export const CreateSettingSchema = z.object({
  category: z.nativeEnum(SettingCategory),
  jsonSettings: z.string(),
});

export const UpdateSettingSchema = z.object({
  jsonSettings: z.string(),
});

export type CreateSettingDto = z.infer<typeof CreateSettingSchema>;
export type UpdateSettingDto = z.infer<typeof UpdateSettingSchema>; 