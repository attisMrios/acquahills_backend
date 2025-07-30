import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ImportService } from './import.service';

@ApiTags('Importación')
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('users')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Importar usuarios desde archivo Excel',
    description: 'Importa usuarios desde un archivo Excel (.xlsx) con validaciones completas'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel (.xlsx) con datos de usuarios'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Usuarios importados exitosamente',
    schema: {
      type: 'object',
      properties: {
        inserted: {
          type: 'number',
          description: 'Número de usuarios insertados exitosamente'
        },
        errors: {
          type: 'number',
          description: 'Número total de errores encontrados'
        },
        errorFile: {
          type: 'string',
          nullable: true,
          description: 'Nombre del archivo de errores generado (si hay errores)'
        },
        details: {
          type: 'object',
          properties: {
            schemaErrors: {
              type: 'number',
              description: 'Errores de validación de esquema'
            },
            validationErrors: {
              type: 'number',
              description: 'Errores de validación de negocio (duplicados, etc.)'
            },
            successfulImports: {
              type: 'number',
              description: 'Importaciones exitosas'
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el formato del archivo o datos inválidos'
  })
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    console.log('Archivo recibido:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer?.length
    });
    
    return this.importService.importUsersFromBuffer(file.buffer);
  }

  @Post('apartments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Importar apartamentos desde archivo Excel',
    description: 'Importa apartamentos desde un archivo Excel (.xlsx) con validaciones completas'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel (.xlsx) con datos de apartamentos'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Apartamentos importados exitosamente',
    schema: {
      type: 'object',
      properties: {
        inserted: {
          type: 'number',
          description: 'Número de apartamentos insertados exitosamente'
        },
        errors: {
          type: 'number',
          description: 'Número total de errores encontrados'
        },
        errorFile: {
          type: 'string',
          nullable: true,
          description: 'Nombre del archivo de errores generado (si hay errores)'
        },
        details: {
          type: 'object',
          properties: {
            schemaErrors: {
              type: 'number',
              description: 'Errores de validación de esquema'
            },
            validationErrors: {
              type: 'number',
              description: 'Errores de validación de negocio (duplicados, etc.)'
            },
            successfulImports: {
              type: 'number',
              description: 'Importaciones exitosas'
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el formato del archivo o datos inválidos'
  })
  async importApartments(@UploadedFile() file: Express.Multer.File) {
    console.log('Archivo de apartamentos recibido:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer?.length
    });
    
    return this.importService.importApartmentsFromBuffer(file.buffer);
  }
}
  