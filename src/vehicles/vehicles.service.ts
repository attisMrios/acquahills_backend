import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { VehicleType } from '@prisma/client';

export interface Vehicle {
  code: string;
  userId: string;
  brand: string;
  color: string;
  model: string;
  vehicleType: VehiculeType;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class VehiclesService {

  constructor(private prisma: PrismaService) { }

  create(createVehicleDto: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data: createVehicleDto });
  }

  findAll() {
    return this.prisma.vehicle.findMany();
  }

  findOne(code: string) {
    return this.prisma.vehicle.findUnique({
      where: {
        code,
      }
    });
  }

  update(code: string, updateVehicleDto: UpdateVehicleDto) {
    return this.prisma.vehicle.update({
      where: { code },
      data: updateVehicleDto
    });
  }

  remove(code: string) {
    return this.prisma.vehicle.delete({
      where: { code }
    });
  }
}
