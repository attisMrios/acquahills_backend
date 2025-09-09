import { ApiProperty } from '@nestjs/swagger';

export class CreateTypeCommonAreaSwaggerDto {
  @ApiProperty({ description: 'Nombre del tipo de área común', maxLength: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción del tipo de área común', maxLength: 255 })
  description: string;
}
