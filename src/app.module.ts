import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { InitModule } from './modules/init/init.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { PropertyOwnersModule } from './modules/property-owners/property-owners.module';
import { UserGroupsModule } from './modules/user-groups/user-groups.module';

@Module({
  imports: [UsersModule, InitModule, ApartmentsModule, PropertyOwnersModule, UserGroupsModule],
})
export class AppModule {}
