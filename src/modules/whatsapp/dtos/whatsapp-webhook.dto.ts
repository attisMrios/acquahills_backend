import { z } from 'zod';

export const WhatsappWebhookSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      field: z.string(),
      value: z.object({
        messaging_product: z.literal('whatsapp'),
        metadata: z.object({
          display_phone_number: z.string(),
          phone_number_id: z.string(),
        }),
        contacts: z.array(z.object({
          wa_id: z.string(),
          profile: z.object({
            name: z.string(),
          }),
        })).optional(),
        messages: z.array(z.object({
          from: z.string(),
          id: z.string(),
          timestamp: z.string(),
          type: z.string(),
          text: z.object({
            body: z.string(),
          }).optional(),
          image: z.object({
            mime_type: z.string(),
            sha256: z.string(),
            id: z.string(),
          }).optional(),
        })).optional(),
        statuses: z.array(z.object({
          id: z.string(),
          status: z.string(),
          timestamp: z.string(),
          recipient_id: z.string(),
        })).optional(),
      }),
    })),
  })),
});

// Tipado inferido
export type WhatsappWebhookDto = z.infer<typeof WhatsappWebhookSchema>;