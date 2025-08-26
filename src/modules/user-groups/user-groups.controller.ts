import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserGroupMembersBulkSwaggerDto } from '../../common/dtos/swagger/create-user-group-members-bulk.swagger.dto';
import { CreateUserGroupSwaggerDto } from '../../common/dtos/swagger/create-user-group.swagger.dto';
import { UpdateUserGroupSwaggerDto } from '../../common/dtos/swagger/update-user-group.swagger.dto';
import { CreateUserGroupDto, CreateUserGroupMembersBulkDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { UserGroupsService } from './user-groups.service';

@ApiTags('User Groups')
@Controller('user-groups')
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo grupo de usuarios' })
  @ApiBody({
    type: CreateUserGroupSwaggerDto,
    description: 'Datos para crear el grupo de usuarios',
  })
  @ApiResponse({ status: 201, description: 'Grupo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un grupo con este nombre' })
  create(@Body() createUserGroupDto: CreateUserGroupDto) {
    return this.userGroupsService.create(createUserGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grupos de usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de grupos obtenida exitosamente' })
  findAll() {
    return this.userGroupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo de usuarios por ID' })
  @ApiResponse({ status: 200, description: 'Grupo obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.userGroupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo de usuarios' })
  @ApiBody({
    type: UpdateUserGroupSwaggerDto,
    description: 'Datos para actualizar el grupo de usuarios',
  })
  @ApiResponse({ status: 200, description: 'Grupo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un grupo con este nombre' })
  update(@Param('id') id: string, @Body() updateUserGroupDto: UpdateUserGroupDto) {
    return this.userGroupsService.update(id, updateUserGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un grupo de usuarios' })
  @ApiResponse({ status: 200, description: 'Grupo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  remove(@Param('id') id: string) {
    return this.userGroupsService.remove(id);
  }

  @Post('members/bulk')
  @ApiOperation({ summary: 'Agregar múltiples usuarios a un grupo' })
  @ApiBody({
    type: CreateUserGroupMembersBulkSwaggerDto,
    description: 'Datos para agregar usuarios al grupo',
  })
  @ApiResponse({ status: 201, description: 'Usuarios agregados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Grupo o usuario no encontrado' })
  addMembers(@Body() createUserGroupMembersBulkDto: CreateUserGroupMembersBulkDto) {
    return this.userGroupsService.addMembers(createUserGroupMembersBulkDto);
  }

  @Delete(':userGroupId/members/:userId')
  @ApiOperation({ summary: 'Eliminar un usuario de un grupo' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado del grupo exitosamente' })
  @ApiResponse({ status: 404, description: 'Relación usuario-grupo no encontrada' })
  removeMember(@Param('userGroupId') userGroupId: string, @Param('userId') userId: string) {
    return this.userGroupsService.removeMember(userGroupId, userId);
  }
}
