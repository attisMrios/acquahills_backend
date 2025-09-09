import { Module } from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { ApartmentsController } from './apartments.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [ApartmentsController],
  providers: [ApartmentsService, PrismaService],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
