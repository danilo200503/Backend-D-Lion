import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Cadastra um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async register(@Body() dto: RegisterDto): Promise<ControllerResponse<AuthResponseDto>> {
    const resultado = await this.authService.register(dto);
    return buildResponse(resultado, 'Usuário cadastrado com sucesso.');
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Autentica um usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() dto: LoginDto): Promise<ControllerResponse<AuthResponseDto>> {
    const resultado = await this.authService.login(dto);
    return buildResponse(resultado, 'Login realizado com sucesso.');
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renova o access token a partir de um refresh token válido' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso.', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado.' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<ControllerResponse<AuthResponseDto>> {
    const resultado = await this.authService.refresh(dto.refreshToken);
    return buildResponse(resultado, 'Token renovado com sucesso.');
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado a partir do access token' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso.', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Token inválido ou não informado.' })
  async me(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ControllerResponse<UserProfileDto>> {
    const usuario = await this.usersService.findById(currentUser.id);
    return buildResponse(this.usersService.toProfileDto(usuario), 'Usuário obtido com sucesso.');
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza logout revogando o refresh token informado' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso.' })
  async logout(@Body() dto: RefreshTokenDto): Promise<ControllerResponse<null>> {
    await this.authService.logout(dto.refreshToken);
    return buildResponse(null, 'Logout realizado com sucesso.');
  }
}
