import { Module } from '@nestjs/common';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { ImportModule } from './modules/import/import.module';
import { InitModule } from './modules/init/init.module';
import { PropertyOwnersModule } from './modules/property-owners/property-owners.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { UserGroupsModule } from './modules/user-groups/user-groups.module';
import { UsersModule } from './modules/users/users.module';
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
    PrismaModule,
  ],
})
export class AppModule {}
