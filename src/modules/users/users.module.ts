import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '.././../common/services/prisma.service';
import { FirebaseService } from 'src/common/services/firebase.service';
import { UpdatesModule } from '../updates/updates.module';

@Module({
  imports: [UpdatesModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, FirebaseService],
})
export class UsersModule {}
