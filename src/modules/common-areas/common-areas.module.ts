import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonAreasController } from './common-areas.controller';
import { CommonAreasService } from './common-areas.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommonAreasController],
  providers: [CommonAreasService],
  exports: [CommonAreasService],
})
export class CommonAreasModule {}
