// src/modules/init/init.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InitService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeAdminUser(data: {
    email: string;
    password: string;
    userName: string;
    fullName: string;
    dni: string;
    phone: string;
    fullPhone: string;
    countryCode: string;
  }) {
    // 1. Crear usuario en Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: data.email,
        password: data.password,
        displayName: data.fullName,
        emailVerified: true,
      });
      await admin.auth().setCustomUserClaims(firebaseUser.uid, { role: 'admin' });
    } catch (err: any) {
      if (err.code === 'auth/email-already-exists') {
        firebaseUser = await admin.auth().getUserByEmail(data.email);
      } else {
        throw err;
      }
    }

    // 2. Crear usuario en la base de datos (Prisma)
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        id: firebaseUser.uid,
        userName: data.userName,
        fullName: data.fullName,
        email: data.email,
        role: 'admin',
        dni: data.dni,
        password: hashedPassword,
        isEmailVerified: true,
        fullPhone: data.fullPhone,
        countryCode: data.countryCode,
      },
    });

    return { firebaseUid: firebaseUser.uid, dbUserId: user.id };
  }
}