import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

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
    const { userId, ...updateData } = updateVehicleDto;
    return this.prisma.vehicle.update({
      where: { code },
      data: updateData
    });
  }

  remove(code: string) {
    return this.prisma.vehicle.delete({
      where: { code }
    });
  }
}
