import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { InitService } from './init.service';
import { CreateUserSwaggerDto } from 'src/common/dtos/swagger/create-user.swagger.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('init')
export class InitController {
  constructor(private readonly initService: InitService) {}

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: CreateUserSwaggerDto,
    description: 'Datos para la inicialización del administrador',
  })
  async initializeAdmin(
    @Body()
    body: {
      email: string;
      password: string;
      userName: string;
      fullName: string;
      dni: string;
      countryCode: string;
      phone: string;
      fullPhone: string;
      secret: string;
    },
  ) {
    // Protege el endpoint con una clave secreta simple
    if (body.secret !== process.env.INIT_SECRET) {
      return { error: 'Unauthorized' };
    }
    const { secret, ...userData } = body;
    return this.initService.initializeAdminUser(userData);
  }
}
