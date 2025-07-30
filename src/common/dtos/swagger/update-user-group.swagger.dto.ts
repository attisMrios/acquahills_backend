import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserGroupSwaggerDto } from './create-user-group.swagger.dto';

export class UpdateUserGroupSwaggerDto extends PartialType(CreateUserGroupSwaggerDto) {} 