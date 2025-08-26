import { Module } from '@nestjs/common';
import { ServicesModule } from '../../common/services/services.module';
import { FcmController } from './fcm.controller';
import { FcmService } from './fcm.service';

@Module({
  imports: [ServicesModule],
  controllers: [FcmController],
  providers: [FcmService],
  exports: [FcmService],
})
export class FcmModule {}
