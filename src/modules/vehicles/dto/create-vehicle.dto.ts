import { ApiProperty } from "@nestjs/swagger";

export enum VehicleType {
  CARRO = 'CARRO',
  MOTO = 'MOTO',
  CAMIONETA = 'CAMIONETA',
  MOTOCARRO = 'MOTOCARRO',
  FURGON = 'FURGON',
  CAMION = 'CAMION'
}

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
    @ApiProperty({ required: true, enum: VehicleType, default: VehicleType.CARRO })
    vehicleType: VehicleType = VehicleType.CARRO
}
