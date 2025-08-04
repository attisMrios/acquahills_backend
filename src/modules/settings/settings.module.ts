import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/common/services/firebase.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { ServicesModule } from 'src/common/services/services.module';
import { MessageCounterService } from './message-counter.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, MessageCounterService, PrismaService, FirebaseService],
  exports: [SettingsService, MessageCounterService],
  imports: [ServicesModule],
})
export class SettingsModule {} 