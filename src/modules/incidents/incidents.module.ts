import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FcmModule } from '../fcm/fcm.module';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [PrismaModule, FcmModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
