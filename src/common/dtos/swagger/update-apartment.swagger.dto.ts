import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateApartmentSwaggerDto } from './create-apartment.swagger.dto';

export class UpdateApartmentSwaggerDto extends PartialType(CreateApartmentSwaggerDto) {} 