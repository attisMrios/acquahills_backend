import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { InitModule } from './modules/init/init.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { PropertyOwnersModule } from './modules/property-owners/property-owners.module';
import { UserGroupsModule } from './modules/user-groups/user-groups.module';
import { ImportModule } from './modules/import/import.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { SettingsModule } from './modules/settings/settings.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    UsersModule,
    InitModule,
    UpdatesModule,
    SettingsModule,
    ApartmentsModule, 
    PropertyOwnersModule, 
    UserGroupsModule,
    ImportModule,
    VehiclesModule,
    PrismaModule
  ],
})
export class AppModule {}

