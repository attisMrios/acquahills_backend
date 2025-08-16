import { ApiProperty } from "@nestjs/swagger";

export enum WeekDay {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY'
}

export class UnavailableDayDto {
    @ApiProperty({ 
        description: 'Día de la semana. REQUERIDO si isFirstWorkingDay es false, DEBE SER NULL si isFirstWorkingDay es true',
        enum: WeekDay,
        example: WeekDay.MONDAY,
        required: false,
        nullable: true
    })
    weekDay?: WeekDay | null;

    @ApiProperty({ 
        description: 'Indica si es el primer día laboral. Si es true, weekDay DEBE SER NULL. Si es false, weekDay es REQUERIDO y debe ser un valor válido del enum.',
        example: false,
        required: true
    })
    isFirstWorkingDay: boolean;
}

export class TimeSlotDto {
    @ApiProperty({ 
        description: 'Hora de inicio en formato HH:MM (ej: 09:00). Debe ser menor que endTime',
        example: '09:00',
        pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
    })
    startTime: string;

    @ApiProperty({ 
        description: 'Hora de fin en formato HH:MM (ej: 18:00). Debe ser mayor que startTime',
        example: '18:00',
        pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
    })
    endTime: string;
}

export class CreateCommonAreaSwaggerDto {

    @ApiProperty({ 
        description: 'ID del tipo de área común',
        example: 1
    })
    typeCommonAreaId: number;

    @ApiProperty({ 
        description: 'Nombre del área común',
        example: 'Sala de eventos'
    })
    name: string;

    @ApiProperty({ 
        description: 'Descripción del área común',
        example: 'Sala para eventos y reuniones'
    })
    description: string;

    @ApiProperty({ 
        description: 'Capacidad máxima de personas',
        example: 50
    })
    maximunCapacity: number;

    @ApiProperty({ 
        description: 'Personas por reserva',
        example: 10
    })
    peoplePerReservation: number;

    @ApiProperty({ 
        description: 'Días no disponibles. Cada objeto debe cumplir las reglas: si isFirstWorkingDay=true, weekDay debe ser null; si isFirstWorkingDay=false, weekDay es requerido',
        type: [UnavailableDayDto],
        example: [
            {
                weekDay: WeekDay.SUNDAY,
                isFirstWorkingDay: false
            },
            {
                weekDay: null,
                isFirstWorkingDay: true
            },
            {
                weekDay: WeekDay.MONDAY,
                isFirstWorkingDay: false
            }
        ]
    })
    unavailableDays: UnavailableDayDto[];

    @ApiProperty({ 
        description: 'Horarios disponibles. Los horarios no pueden superponerse entre sí. Formato HH:MM requerido.',
        type: [TimeSlotDto],
        example: [
            {
                startTime: '09:00',
                endTime: '12:00'
            },
            {
                startTime: '14:00',
                endTime: '18:00'
            }
        ]
    })
    timeSlots: TimeSlotDto[];
}
