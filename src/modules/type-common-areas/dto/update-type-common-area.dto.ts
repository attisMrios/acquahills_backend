import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeCommonAreaDto } from './create-type-common-area.dto';

export class UpdateTypeCommonAreaDto extends PartialType(CreateTypeCommonAreaDto) {}
