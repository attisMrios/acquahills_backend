import { ApiProperty } from '@nestjs/swagger';

export class CreateTypeCommonAreaDto {
  @ApiProperty({ description: 'Nombre del tipo de área común' })
  name: string;

  @ApiProperty({ description: 'Descripción del tipo de área común' })
  description: string;
}
