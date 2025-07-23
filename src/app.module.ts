import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { InitModule } from './modules/init/init.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UsersModule, InitModule, UpdatesModule, VehiclesModule, PrismaModule],
})
export class AppModule {}
