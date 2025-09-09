import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('sse')
export class UpdatesController {
  constructor(private readonly updatesService: UpdatesService) {}

  @Sse('users')
  userEvents(): Observable<MessageEvent> {
    return this.updatesService.getUserEvents().pipe(map((event) => ({ data: event })));
  }

  @Sse('vehicles')
  vehicleEvents(): Observable<MessageEvent> {
    return this.updatesService.getVehicleEvents().pipe(map((event) => ({ data: event })));
  }
}
