# Migración de class-validator a Zod

## Resumen

Este módulo ha sido migrado de `class-validator` a `zod` para la validación de datos. Zod es una biblioteca de validación de esquemas TypeScript-first que ofrece mejor rendimiento y tipado más estricto.

## Cambios realizados

### 1. Archivos eliminados
- `conversation-filters.dto.ts` - Reemplazado por esquemas de Zod
- `conversation.dto.ts` - Reemplazado por esquemas de Zod

### 2. Archivos creados/modificados
- `conversation.schema.ts` - Nuevo archivo con esquemas de Zod y DTOs para Swagger
- `whatsapp.controller.ts` - Actualizado para usar validación con Zod
- `whatsapp.service.ts` - Actualizado para usar tipos de Zod

## Esquemas de Zod implementados

### ConversationSchema
```typescript
export const ConversationSchema = z.object({
  waId: z.string(),
  contactName: z.string(),
  messageCount: z.number(),
  lastMessageAt: z.date(),
  firstMessageAt: z.date()
});
```

### ConversationFiltersSchema
```typescript
export const ConversationFiltersSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['lastMessageAt', 'messageCount', 'contactName']).default('lastMessageAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
```

## Ventajas de Zod sobre class-validator

1. **Mejor rendimiento**: Zod es más rápido en validación
2. **Tipado más estricto**: Inferencia automática de tipos TypeScript
3. **Transformación automática**: `z.coerce.number()` convierte strings a números automáticamente
4. **Validación en tiempo de compilación**: Errores se detectan antes de ejecución
5. **API más intuitiva**: Sintaxis más clara y concisa

## Uso en el controlador

### Validación con Zod
```typescript
// Validar parámetros con Zod
const validationResult = ConversationFiltersSchema.safeParse(filters);

if (!validationResult.success) {
  return res.status(400).json({
    success: false,
    error: 'Parámetros de consulta inválidos',
    details: validationResult.error.errors,
    // ... resto de la respuesta
  });
}

const validatedFilters = validationResult.data;
```

### Manejo de errores
- **400 Bad Request**: Cuando los parámetros no pasan validación
- **500 Internal Server Error**: Para errores del servidor

## Compatibilidad con Swagger

Los DTOs de clase se mantienen para la documentación de Swagger, mientras que los esquemas de Zod se usan para la validación real. Esto asegura que la documentación de la API permanezca intacta.

## Tipos TypeScript

Los tipos se derivan automáticamente de los esquemas de Zod:

```typescript
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationFilters = z.infer<typeof ConversationFiltersSchema>;
```

## Próximos pasos

1. **Migrar otros DTOs**: Aplicar el mismo patrón a otros endpoints
2. **Validación de respuestas**: Usar Zod para validar respuestas del servicio
3. **Tests**: Agregar tests unitarios para los esquemas de validación
4. **Middleware**: Considerar crear un middleware global para validación con Zod

## Dependencias requeridas

- `zod`: Para validación de esquemas
- `@nestjs/swagger`: Para documentación de la API (ya instalado)

## Ejemplo de uso completo

```typescript
// En el controlador
@Get('get-conversations-filtered')
async getConversationsWithFilters(@Query() filters: any) {
  const validationResult = ConversationFiltersSchema.safeParse(filters);
  
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Parámetros inválidos',
      details: validationResult.error.errors
    });
  }

  const validatedFilters = validationResult.data;
  const response = await this.whatsappService.getConversationsWithFilters(validatedFilters);
  
  return res.status(200).json(response);
}
```
