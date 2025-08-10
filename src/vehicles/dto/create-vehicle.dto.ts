import { ApiProperty } from "@nestjs/swagger";
// Corregido: VehiculeType no existe, debe ser VehicleType
import { VehicleType } from "@prisma/client";

export class CreateVehicleDto {
    @ApiProperty({ required: true })
    code: string;
    @ApiProperty({ required: true })
    userId: string;
    @ApiProperty({ required: true })
    brand: string;
    @ApiProperty({ required: true })
    color: string;
    @ApiProperty({ required: true })
    model: string;
    @ApiProperty({ required: true, default: 'CARRO' })
    vehicleType: VehiculeType = 'CARRO'
}
