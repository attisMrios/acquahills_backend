import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '.././../common/services/prisma.service';
import { UpdatesModule } from '../updates/updates.module';
import { ServicesModule } from 'src/common/services/services.module';

@Module({
  imports: [UpdatesModule, ServicesModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
