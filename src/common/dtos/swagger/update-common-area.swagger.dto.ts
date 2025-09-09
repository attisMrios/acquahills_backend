import { PartialType } from '@nestjs/swagger';
import { CreateCommonAreaSwaggerDto } from './create-common-area.swagger.dto';

export class UpdateCommonAreaSwaggerDto extends PartialType(CreateCommonAreaSwaggerDto) {}
