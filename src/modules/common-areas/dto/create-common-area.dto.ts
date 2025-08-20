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
        description: 'Día de la semana (requerido solo si isFirstWorkingDay es false)',
        enum: WeekDay,
        example: WeekDay.MONDAY,
        required: false
    })
    weekDay?: WeekDay;

    @ApiProperty({ 
        description: 'Indica si es el primer día laboral. Si es true, weekDay debe ser null. Si es false, weekDay es requerido.',
        example: false
    })
    isFirstWorkingDay: boolean;
}

export class TimeSlotDto {
    @ApiProperty({ 
        description: 'Hora de inicio',
        example: '09:00'
    })
    startTime: string;

    @ApiProperty({ 
        description: 'Hora de fin',
        example: '18:00'
    })
    endTime: string;
}

export class CreateCommonAreaDto {
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
        description: 'Días no disponibles',
        type: [UnavailableDayDto],
        example: [
            {
                weekDay: WeekDay.SUNDAY,
                isFirstWorkingDay: false
            },
            {
                weekDay: null,
                isFirstWorkingDay: true
            }
        ]
    })
    unavailableDays: UnavailableDayDto[];

    @ApiProperty({ 
        description: 'Horarios disponibles',
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
