// src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FirebaseService } from './firebase.service';
import { PrismaService } from './prisma.service';

@Global() // <-- Esto lo hace global
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [FirebaseService, PrismaService],
  exports: [FirebaseService, PrismaService, EventEmitterModule],
})
export class ServicesModule {}
