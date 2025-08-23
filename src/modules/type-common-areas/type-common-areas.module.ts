import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { TypeCommonAreasController } from './type-common-areas.controller';
import { TypeCommonAreasService } from './type-common-areas.service';

@Module({
  controllers: [TypeCommonAreasController],
  providers: [TypeCommonAreasService, PrismaService],
  exports: [TypeCommonAreasService]
})
export class TypeCommonAreasModule {}
