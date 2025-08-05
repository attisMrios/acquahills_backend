import { ConflictException, Injectable } from '@nestjs/common';
import { WeekDay } from '@prisma/client';
import { CreateCommonAreaDto as CreateCommonAreaInputDto } from 'src/common/dtos/inputs/commonArea.input.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateCommonAreaDto } from './dto/create-common-area.dto';
import { UpdateCommonAreaDto } from './dto/update-common-area.dto';

@Injectable()
export class CommonAreasService {
  constructor(private readonly prisma: PrismaService) {}
  
  async create(createCommonAreaDto: CreateCommonAreaDto | CreateCommonAreaInputDto) {
    try {
      const commonArea = await this.prisma.commonArea.create({
        data: {
          name: createCommonAreaDto.name,
          description: createCommonAreaDto.description,
          maximunCapacity: createCommonAreaDto.maximunCapacity,
          peoplePerReservation: createCommonAreaDto.peoplePerReservation,
          unavailableDays: {
            create: createCommonAreaDto.unavailableDays?.map(day => ({ weekDay: day as WeekDay })),
          },
          timeSlots: {
            create: createCommonAreaDto.timeSlots?.map(slot => ({ startTime: slot, endTime: slot })),
          },
        },
      });
      return commonArea;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('El área común ya existe');
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all commonAreas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commonArea`;
  }

  update(id: number, updateCommonAreaDto: UpdateCommonAreaDto) {
    return `This action updates a #${id} commonArea`;
  }

  remove(id: number) {
    return `This action removes a #${id} commonArea`;
  }
}
