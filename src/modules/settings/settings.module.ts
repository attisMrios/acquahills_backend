import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { FirebaseService } from 'src/common/services/firebase.service';
import { ServicesModule } from 'src/common/services/services.module';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService, FirebaseService],
  exports: [SettingsService],
  imports: [ServicesModule],
})
export class SettingsModule {} 