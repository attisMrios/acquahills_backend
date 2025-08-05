import { ApiProperty } from "@nestjs/swagger";

export class CreateCommonAreaDto {
    @ApiProperty({ description: 'Nombre del área común' })
    name: string;

    @ApiProperty({ description: 'Descripción del área común' })
    description: string;

    @ApiProperty({ description: 'Capacidad máxima de personas' })
    maximunCapacity: number;

    @ApiProperty({ description: 'Personas por reserva' })
    peoplePerReservation: number;

    @ApiProperty({ description: 'Días no disponibles' })
    unavailableDays: string[];

    @ApiProperty({ description: 'Horarios disponibles' })
    timeSlots: string[];
}
