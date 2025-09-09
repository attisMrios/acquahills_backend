import { z } from 'zod';

export const WeekDayEnum = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

// Función auxiliar para convertir hora a minutos
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Función auxiliar para validar formato de hora (HH:MM)
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Schema para TimeSlot con validaciones individuales
export const TimeSlotSchema = z
  .object({
    startTime: z
      .string()
      .min(1, 'La hora de inicio es requerida')
      .refine(isValidTimeFormat, 'La hora de inicio debe tener formato HH:MM (ej: 09:00)'),
    endTime: z
      .string()
      .min(1, 'La hora de fin es requerida')
      .refine(isValidTimeFormat, 'La hora de fin debe tener formato HH:MM (ej: 18:00)'),
  })
  .refine(
    (data) => {
      const startMinutes = timeToMinutes(data.startTime);
      const endMinutes = timeToMinutes(data.endTime);
      return startMinutes < endMinutes;
    },
    {
      message: 'La hora de inicio debe ser menor que la hora de fin',
      path: ['endTime'],
    },
  );

// Esquema para UnavailableDay con validación condicional
export const UnavailableDaySchema = z
  .object({
    weekDay: WeekDayEnum.nullable(),
    isFirstWorkingDay: z.boolean(),
  })
  .refine(
    (data) => {
      // Si isFirstWorkingDay es true, weekDay debe ser null
      if (data.isFirstWorkingDay) {
        return data.weekDay === null;
      }
      // Si isFirstWorkingDay es false, weekDay debe tener un valor
      return data.weekDay !== null;
    },
    {
      message:
        'Si isFirstWorkingDay es true, weekDay debe ser null. Si isFirstWorkingDay es false, weekDay es requerido.',
      path: ['weekDay'],
    },
  );

// Función para validar que no hay superposición de horarios
function validateNoOverlap(timeSlots: Array<{ startTime: string; endTime: string }>): boolean {
  for (let i = 0; i < timeSlots.length; i++) {
    for (let j = i + 1; j < timeSlots.length; j++) {
      const slot1 = timeSlots[i];
      const slot2 = timeSlots[j];

      const start1 = timeToMinutes(slot1.startTime);
      const end1 = timeToMinutes(slot1.endTime);
      const start2 = timeToMinutes(slot2.startTime);
      const end2 = timeToMinutes(slot2.endTime);

      // Verificar si hay superposición
      if (!(end1 <= start2 || end2 <= start1)) {
        return false; // Hay superposición
      }
    }
  }
  return true; // No hay superposición
}

export const CreateCommonAreaSchema = z.object({
  typeCommonAreaId: z.number().min(1, 'El tipo de área común es requerido'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().max(255, 'La descripción no puede exceder 255 caracteres'),
  maximunCapacity: z.number().min(1, 'La capacidad máxima es requerida'),
  peoplePerReservation: z.number().min(1, 'Las personas por reserva son requeridas'),
  unavailableDays: z.array(UnavailableDaySchema),
  timeSlots: z
    .array(TimeSlotSchema)
    .min(1, 'Debe tener al menos un horario disponible')
    .refine(validateNoOverlap, {
      message:
        'Los horarios no pueden superponerse. Verifique que no haya conflictos entre los rangos de tiempo.',
      path: ['timeSlots'],
    }),
});

export const UpdateCommonAreaSchema = z.object({
  typeCommonAreaId: z.number().min(1, 'El tipo de área común es requerido').optional(),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  description: z.string().max(255, 'La descripción no puede exceder 255 caracteres').optional(),
  maximunCapacity: z.number().min(1, 'La capacidad máxima es requerida').optional(),
  peoplePerReservation: z.number().min(1, 'Las personas por reserva son requeridas').optional(),
  unavailableDays: z.array(UnavailableDaySchema).optional(),
  timeSlots: z
    .array(TimeSlotSchema)
    .min(1, 'Debe tener al menos un horario disponible')
    .refine(validateNoOverlap, {
      message:
        'Los horarios no pueden superponerse. Verifique que no haya conflictos entre los rangos de tiempo.',
      path: ['timeSlots'],
    })
    .optional(),
});

export const CommonAreaQuerySchema = z.object({
  page: z.coerce.number().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.coerce
    .number()
    .min(1, 'El límite debe ser mayor a 0')
    .max(100, 'El límite no puede exceder 100')
    .default(10),
  search: z.string().optional(),
  name: z.string().optional(),
  typeCommonAreaId: z.number().optional(),
  description: z.string().optional(),
  maximunCapacity: z.number().optional(),
  peoplePerReservation: z.number().optional(),
  unavailableDays: z.array(UnavailableDaySchema),
  timeSlots: z.array(TimeSlotSchema).optional(),
});

export const CommonAreaIdSchema = z.object({
  id: z.coerce.number().min(1, 'El ID del área común debe ser un número válido mayor a 0'),
});

export const UniqueCommonAreaSchema = z.object({
  commonArea: z
    .string()
    .min(1, 'El nombre del área común es requerido')
    .max(100, 'El nombre del área común no puede exceder 100 caracteres'),
  typeCommonAreaId: z.number().optional(),
  description: z.string().max(255, 'La descripción no puede exceder 255 caracteres'),
  maximunCapacity: z.number().min(1, 'La capacidad máxima es requerida'),
  peoplePerReservation: z.number().min(1, 'Las personas por reserva son requeridas'),
  unavailableDays: z.array(UnavailableDaySchema),
  timeSlots: z
    .array(TimeSlotSchema)
    .min(1, 'Debe tener al menos un horario disponible')
    .refine(validateNoOverlap, {
      message:
        'Los horarios no pueden superponerse. Verifique que no haya conflictos entre los rangos de tiempo.',
      path: ['timeSlots'],
    }),
});

export const CommonAreaFilterSchema = z.object({
  name: z.string().optional(),
  typeCommonAreaId: z.number().optional(),
  description: z.string().optional(),
  maximunCapacity: z.number().optional(),
  peoplePerReservation: z.number().optional(),
  unavailableDays: z.array(UnavailableDaySchema),
  timeSlots: z.array(TimeSlotSchema).optional(),
});

export type CreateCommonAreaDto = z.infer<typeof CreateCommonAreaSchema>;
export type UpdateCommonAreaDto = z.infer<typeof UpdateCommonAreaSchema>;
export type CommonAreaQueryDto = z.infer<typeof CommonAreaQuerySchema>;
export type CommonAreaIdDto = z.infer<typeof CommonAreaIdSchema>;
export type UniqueCommonAreaDto = z.infer<typeof UniqueCommonAreaSchema>;
export type CommonAreaFilterDto = z.infer<typeof CommonAreaFilterSchema>;
