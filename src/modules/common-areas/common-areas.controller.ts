import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCommonAreaSchema } from 'src/common/dtos/inputs/commonArea.input.dto';
import { CommonAreasService } from './common-areas.service';
import { CreateCommonAreaDto } from './dto/create-common-area.dto';
import { UpdateCommonAreaDto } from './dto/update-common-area.dto';

@ApiTags('common-areas')
@Controller('common-areas')
export class CommonAreasController {
  constructor(private readonly commonAreasService: CommonAreasService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un área común' })
  @ApiBody({ type: CreateCommonAreaDto, description: 'Datos para crear el área común' })
  @ApiResponse({ status: 201, description: 'Área común creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El área común ya existe' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createCommonAreaDto: CreateCommonAreaDto): Promise<any> {
    try {
      const validatedData = CreateCommonAreaSchema.parse(createCommonAreaDto);
      return this.commonAreasService.create(validatedData);
    } catch (error) {
      if (error.errors) {
        throw new BadRequestException({
          message: 'Datos de entrada inválidos',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.commonAreasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commonAreasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommonAreaDto: UpdateCommonAreaDto) {
    return this.commonAreasService.update(+id, updateCommonAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commonAreasService.remove(+id);
  }
}
