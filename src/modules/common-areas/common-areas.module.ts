import { Module } from '@nestjs/common';
import { CommonAreasController } from './common-areas.controller';
import { CommonAreasService } from './common-areas.service';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [CommonAreasController],
  providers: [CommonAreasService , PrismaService],
  exports: [CommonAreasService],
})
export class CommonAreasModule {}
