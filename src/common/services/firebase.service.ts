// src/common/services/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';


@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    if (admin.apps.length === 0) {
      this.firebaseApp = admin.initializeApp({
        credential:admin.credential.applicationDefault(),
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  getFirebaseAuth(): admin.auth.Auth {
    return admin.auth(this.firebaseApp);
  }
}