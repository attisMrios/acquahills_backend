import { Module } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsController } from './user-groups.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [UserGroupsController],
  providers: [UserGroupsService, PrismaService],
  exports: [UserGroupsService],
})
export class UserGroupsModule {}
