import { Module } from '@nestjs/common';
import { PropertyOwnersService } from './property-owners.service';
import { PropertyOwnersController } from './property-owners.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [PropertyOwnersController],
  providers: [PropertyOwnersService, PrismaService],
  exports: [PropertyOwnersService],
})
export class PropertyOwnersModule {}
