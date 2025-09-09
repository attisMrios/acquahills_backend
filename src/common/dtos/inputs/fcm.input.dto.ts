import { z } from 'zod';

export const RegisterTokenSchema = z.object({
  fcmToken: z.string().min(1, 'El token FCM es requerido'),
});

export type RegisterTokenDto = z.infer<typeof RegisterTokenSchema>;

export const FcmTopicSchema = z.object({
  topic: z.string().min(1, 'El topic es requerido'),
  tokens: z
    .array(z.string().min(1, 'Cada token debe ser una cadena válida'))
    .min(1, 'Al menos un token es requerido'),
  userId: z.string().min(1, 'El userId es requerido'),
});

export type FcmTopicDto = z.infer<typeof FcmTopicSchema>;

export const FcmNotificationSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  body: z.string().min(1, 'El cuerpo del mensaje es requerido'),
  topic: z.string().min(1, 'El topic es requerido'),
  image: z.string().url('La imagen debe ser una URL válida').optional(),
});

export type FcmNotificationDto = z.infer<typeof FcmNotificationSchema>;
