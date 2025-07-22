import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { InitModule } from './modules/init/init.module';

@Module({
  imports: [UsersModule, InitModule],
})
export class AppModule {}
