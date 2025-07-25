// src/common/common.module.ts
import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { PrismaService } from './prisma.service';

@Global() // <-- Esto lo hace global
@Module({
  providers: [FirebaseService, PrismaService],
  exports: [FirebaseService, PrismaService],
})
export class ServicesModule {}