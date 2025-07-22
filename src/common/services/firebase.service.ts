// src/common/services/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';


@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    this.firebaseApp = admin.initializeApp({
      credential:admin.credential.applicationDefault(),
    });
  }

  getFirebaseAuth(): admin.auth.Auth {
    return admin.auth(this.firebaseApp);
  }
}