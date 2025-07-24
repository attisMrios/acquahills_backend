import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { InitModule } from './modules/init/init.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    UsersModule,
    InitModule,
    UpdatesModule,
    SettingsModule,
  ],
})
export class AppModule {}
