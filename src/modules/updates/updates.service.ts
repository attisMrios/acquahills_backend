import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class UpdatesService {
  private userEvents$ = new Subject<{ type: string; payload: any }>();
  private vehicleEvents$ = new Subject<{ type: string; payload: any }>();

  // Usuarios
  emitUserEvent(type: 'created' | 'updated' | 'deleted', payload: any) {
    this.userEvents$.next({ type, payload });
  }
  getUserEvents() {
    return this.userEvents$.asObservable();
  }

  // Vehículos
  emitVehicleEvent(type: 'created' | 'updated' | 'deleted', payload: any) {
    this.vehicleEvents$.next({ type, payload });
  }
  getVehicleEvents() {
    return this.vehicleEvents$.asObservable();
  }
} 