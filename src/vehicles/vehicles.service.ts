import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import e from 'express';



export interface Apartment {
  code: string;           // Cambiado de uid (string) a id (number)
  userId: string;
  address: string;
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
