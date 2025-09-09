import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

// Esquemas de Zod
export const ConversationSchema = z.object({
  waId: z.string(),
  contactName: z.string(),
  messageCount: z.number(),
  lastMessageAt: z.date(),
  firstMessageAt: z.date(),
});

export const ConversationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ConversationSchema),
  total: z.number(),
  error: z.string().optional(),
});

export const ConversationFiltersSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['lastMessageAt', 'messageCount', 'contactName']).default('lastMessageAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const ConversationPaginationSchema = z.object({
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

export const ConversationsWithFiltersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ConversationSchema),
  total: z.number(),
  pagination: ConversationPaginationSchema,
  error: z.string().optional(),
});

// DTOs para Swagger (mantienen la compatibilidad)
export class ConversationDto {
  @ApiProperty({
    description: 'ID único del contacto de WhatsApp',
    example: '573178915937',
  })
  waId: string;

  @ApiProperty({
    description: 'Nombre del contacto formateado (sin número de teléfono)',
    example: 'Juanma',
  })
  contactName: string;

  @ApiProperty({
    description: 'Número total de mensajes en la conversación',
    example: 15,
  })
  messageCount: number;

  @ApiProperty({
    description: 'Fecha del último mensaje recibido',
    example: '2024-01-15T10:30:00Z',
  })
  lastMessageAt: Date;

  @ApiProperty({
    description: 'Fecha del primer mensaje recibido',
    example: '2024-01-10T08:15:00Z',
  })
  firstMessageAt: Date;
}

export class ConversationsResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Array de conversaciones únicas',
    type: [ConversationDto],
  })
  data: ConversationDto[];

  @ApiProperty({
    description: 'Número total de conversaciones',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Mensaje de error si la operación falló',
    required: false,
    example: 'Error al conectar con la base de datos',
  })
  error?: string;
}

export class ConversationFiltersDto {
  @ApiProperty({
    description: 'Término de búsqueda para filtrar por nombre de contacto o número',
    required: false,
    example: 'Juanma',
  })
  search?: string;

  @ApiProperty({
    description: 'Número máximo de conversaciones a retornar',
    required: false,
    default: 50,
    minimum: 1,
    maximum: 100,
    example: 25,
  })
  limit?: number = 50;

  @ApiProperty({
    description: 'Número de conversaciones a omitir (para paginación)',
    required: false,
    default: 0,
    minimum: 0,
    example: 0,
  })
  offset?: number = 0;

  @ApiProperty({
    description: 'Campo por el cual ordenar los resultados',
    required: false,
    default: 'lastMessageAt',
    enum: ['lastMessageAt', 'messageCount', 'contactName'],
    example: 'lastMessageAt',
  })
  sortBy?: 'lastMessageAt' | 'messageCount' | 'contactName' = 'lastMessageAt';

  @ApiProperty({
    description: 'Orden de clasificación',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ConversationPaginationDto {
  @ApiProperty({
    description: 'Número máximo de conversaciones por página',
    example: 50,
  })
  limit: number;

  @ApiProperty({
    description: 'Número de conversaciones omitidas',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Indica si hay más páginas disponibles',
    example: true,
  })
  hasMore: boolean;
}

export class ConversationsWithFiltersResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Array de conversaciones únicas filtradas',
    type: [ConversationDto],
  })
  data: ConversationDto[];

  @ApiProperty({
    description: 'Número total de conversaciones que coinciden con los filtros',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Información de paginación',
    type: ConversationPaginationDto,
  })
  pagination: ConversationPaginationDto;

  @ApiProperty({
    description: 'Mensaje de error si la operación falló',
    required: false,
    example: 'Error al conectar con la base de datos',
  })
  error?: string;
}

// Tipos de TypeScript derivados de los esquemas
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationsResponse = z.infer<typeof ConversationsResponseSchema>;
export type ConversationFilters = z.infer<typeof ConversationFiltersSchema>;
export type ConversationPagination = z.infer<typeof ConversationPaginationSchema>;
export type ConversationsWithFiltersResponse = z.infer<
  typeof ConversationsWithFiltersResponseSchema
>;
