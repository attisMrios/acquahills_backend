import { PartialType } from '@nestjs/swagger';
import { CreateTypeCommonAreaDto } from './create-type-common-area.dto';

export class UpdateTypeCommonAreaDto extends PartialType(CreateTypeCommonAreaDto) {}
