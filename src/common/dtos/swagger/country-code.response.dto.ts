import { ApiProperty } from '@nestjs/swagger';

export class CountryCodeResponseDto {
  @ApiProperty({
    description: 'Nombre del país en español',
    example: 'Colombia'
  })
  nameES: string;

  @ApiProperty({
    description: 'Nombre del país en inglés',
    example: 'Colombia'
  })
  nameEN: string;

  @ApiProperty({
    description: 'Código ISO 2 del país',
    example: 'CO'
  })
  iso2: string;

  @ApiProperty({
    description: 'Código ISO 3 del país',
    example: 'COL'
  })
  iso3: string;

  @ApiProperty({
    description: 'Código telefónico del país',
    example: '57'
  })
  phoneCode: string;
} 