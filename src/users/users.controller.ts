import { BadRequestException, Body, Controller, Get, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { avatarUploadOptions } from '../config/multer.config';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';


@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  async getProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ControllerResponse<UserProfileDto>> {
    const usuario = await this.usersService.findById(currentUser.id);
    return buildResponse(this.usersService.toProfileDto(usuario), 'Perfil obtido com sucesso.');
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualiza o perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ControllerResponse<UserProfileDto>> {
    const usuario = await this.usersService.updateProfile(currentUser.id, dto);
    return buildResponse(this.usersService.toProfileDto(usuario), 'Perfil atualizado com sucesso.');
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Altera a senha do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  async changePassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<ControllerResponse<null>> {
    await this.usersService.changePassword(currentUser.id, dto);
    return buildResponse(null, 'Senha alterada com sucesso.');
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', avatarUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiOperation({ summary: 'Envia (upload) um novo avatar para o usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Arquivo ausente ou em formato inválido.' })
  async uploadAvatar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ControllerResponse<UserProfileDto>> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const avatarPath = `/uploads/avatars/${file.filename}`;
    const usuario = await this.usersService.updateAvatar(currentUser.id, avatarPath);
    return buildResponse(this.usersService.toProfileDto(usuario), 'Avatar atualizado com sucesso.');
  }
}
