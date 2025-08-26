import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleOwnerResponseDto } from './dto/vehicle-owner.response.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

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
      },
    });
  }

  update(code: string, updateVehicleDto: UpdateVehicleDto) {
    const { userId, ...updateData } = updateVehicleDto;
    return this.prisma.vehicle.update({
      where: { code },
      data: updateData,
    });
  }

  remove(code: string) {
    return this.prisma.vehicle.delete({
      where: { code },
    });
  }

  async findOwnerByPlate(plate: string): Promise<VehicleOwnerResponseDto> {
    // Buscar el vehículo por placa con información del propietario
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { code: plate.toUpperCase() },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`No se encontró ningún vehículo con la placa ${plate}`);
    }

    if (!vehicle.user) {
      throw new NotFoundException(
        `El vehículo con placa ${plate} no tiene un propietario asignado`,
      );
    }

    return {
      vehicle: {
        code: vehicle.code,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        vehicleType: vehicle.vehicleType,
      },
      owner: {
        id: vehicle.user.id,
        fullName: vehicle.user.fullName,
      },
    };
  }
}
