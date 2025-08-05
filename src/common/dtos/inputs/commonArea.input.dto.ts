import { z } from "zod";

export const CreateCommonAreaSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
    description: z.string()
        .max(255, 'La descripción no puede exceder 255 caracteres'),
    maximunCapacity: z.number().min(1, 'La capacidad máxima es requerida'),
    peoplePerReservation: z.number().min(1, 'Las personas por reserva son requeridas'),
    unavailableDays: z.array(z.string())
        .optional(),
    timeSlots: z.array(z.string()).optional(),
});

export const UpdateCommonAreaSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
    description: z.string()
        .max(255, 'La descripción no puede exceder 255 caracteres'),
    maximunCapacity: z.number().min(1, 'La capacidad máxima es requerida'),
    peoplePerReservation: z.number().min(1, 'Las personas por reserva son requeridas'),
    unavailableDays: z.array(z.string())
        .optional(),
    timeSlots: z.array(z.string()).optional(),
});

export const CommonAreaQuerySchema = z.object({
    page: z.coerce.number().min(1, 'La página debe ser mayor a 0').default(1),
    limit: z.coerce.number().min(1, 'El límite debe ser mayor a 0').max(100, 'El límite no puede exceder 100').default(10),
    search: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    maximunCapacity: z.number().optional(),
    peoplePerReservation: z.number().optional(),
    unavailableDays: z.array(z.string()).optional(),
    timeSlots: z.array(z.string()).optional(),
});

export const CommonAreaIdSchema = z.object({
    id: z.coerce.number().min(1, 'El ID del área común debe ser un número válido mayor a 0')
});

export const UniqueCommonAreaSchema = z.object({
    commonArea: z.string()
    .min(1, 'El nombre del área común es requerido')
    .max(100, 'El nombre del área común no puede exceder 100 caracteres'),
    description: z.string()
        .max(255, 'La descripción no puede exceder 255 caracteres'),
    maximunCapacity: z.number().min(1, 'La capacidad máxima es requerida'),
    peoplePerReservation: z.number().min(1, 'Las personas por reserva son requeridas'),
    unavailableDays: z.array(z.string())
        .optional(),
    timeSlots: z.array(z.string()).optional()
});

export const CommonAreaFilterSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    maximunCapacity: z.number().optional(),
    peoplePerReservation: z.number().optional(),
    unavailableDays: z.array(z.string()).optional(),
});



export type CreateCommonAreaDto = z.infer<typeof CreateCommonAreaSchema>;
export type UpdateCommonAreaDto = z.infer<typeof UpdateCommonAreaSchema>;
export type CommonAreaQueryDto = z.infer<typeof CommonAreaQuerySchema>;
export type CommonAreaIdDto = z.infer<typeof CommonAreaIdSchema>;
export type UniqueCommonAreaDto = z.infer<typeof UniqueCommonAreaSchema>;
export type CommonAreaFilterDto = z.infer<typeof CommonAreaFilterSchema>;
