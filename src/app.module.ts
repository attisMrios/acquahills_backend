import { Module } from '@nestjs/common';
import { ServicesModule } from './common/services/services.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { ImportModule } from './modules/import/import.module';
import { InitModule } from './modules/init/init.module';
import { PropertyOwnersModule } from './modules/property-owners/property-owners.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { UserGroupsModule } from './modules/user-groups/user-groups.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { PrismaModule } from './prisma/prisma.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ServicesModule, // Servicios globales (Firebase, Prisma)
    UsersModule,
    InitModule,
    UpdatesModule,
    SettingsModule,
    ApartmentsModule, 
    PropertyOwnersModule, 
    UserGroupsModule,
    ImportModule,
    VehiclesModule,
    PrismaModule,
    WhatsappModule
  ],
})
export class AppModule {}

