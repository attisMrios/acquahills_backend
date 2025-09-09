import { Module } from '@nestjs/common';
import { ServicesModule } from './common/services/services.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { CommonAreasModule } from './modules/common-areas/common-areas.module';
import { FcmModule } from './modules/fcm/fcm.module';
import { ImportModule } from './modules/import/import.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { InitModule } from './modules/init/init.module';
import { PropertyOwnersModule } from './modules/property-owners/property-owners.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TypeCommonAreasModule } from './modules/type-common-areas/type-common-areas.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { UserGroupsModule } from './modules/user-groups/user-groups.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

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
    PrismaModule,
    CommonAreasModule,
    VehiclesModule,
    IncidentsModule,
    PrismaModule,
    FcmModule,
    TypeCommonAreasModule,
    WhatsappModule,
  ],
})
export class AppModule {}
