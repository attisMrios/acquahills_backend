import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTypeCommonAreaSwaggerDto } from './create-type-common-area.swagger.dto';

export class UpdateTypeCommonAreaSwaggerDto extends PartialType(CreateTypeCommonAreaSwaggerDto) {
  @ApiProperty({
    description: 'Nombre del tipo de área común (opcional para actualización)',
    maxLength: 100,
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Descripción del tipo de área común (opcional para actualización)',
    maxLength: 255,
    required: false,
  })
  description?: string;
}
