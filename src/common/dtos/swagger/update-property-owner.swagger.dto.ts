import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePropertyOwnerSwaggerDto } from './create-property-owner.swagger.dto';

export class UpdatePropertyOwnerSwaggerDto extends PartialType(CreatePropertyOwnerSwaggerDto) {} 