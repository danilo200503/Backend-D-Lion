import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { AppConfigService } from '../config/app-config.service';
import { GoogleUserPayload } from './strategies/google.strategy';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: AppConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Cadastra um novo usuário e envia e-mail de verificação' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado. E-mail de verificação enviado.', type: RegisterResponseDto })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async register(@Body() dto: RegisterDto): Promise<ControllerResponse<RegisterResponseDto>> {
    const resultado = await this.authService.register(dto);
    return buildResponse(resultado, 'Cadastro realizado. Verifique seu e-mail para ativar a conta.');
  }

  @Public()
  @Post('verificar-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirma o e-mail a partir do token enviado e já autentica o usuário' })
  @ApiResponse({ status: 200, description: 'E-mail verificado com sucesso.', type: AuthResponseDto })
  async verificarEmail(@Body() dto: VerifyEmailDto): Promise<ControllerResponse<AuthResponseDto>> {
    const resultado = await this.authService.verificarEmail(dto.token);
    return buildResponse(resultado, 'E-mail verificado com sucesso.');
  }

  @Public()
  @Post('reenviar-verificacao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenvia o e-mail de verificação de conta' })
  @ApiResponse({ status: 200, description: 'E-mail de verificação reenviado, se aplicável.' })
  async reenviarVerificacao(@Body() dto: ResendVerificationDto): Promise<ControllerResponse<null>> {
    await this.authService.reenviarVerificacao(dto.email);
    return buildResponse(null, 'Se o e-mail existir e ainda não estiver verificado, um novo link foi enviado.');
  }

  @Public()
  @Post('esqueci-senha')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicita a redefinição de senha por e-mail' })
  @ApiResponse({ status: 200, description: 'E-mail de redefinição enviado, se aplicável.' })
  async esqueciSenha(@Body() dto: ForgotPasswordDto): Promise<ControllerResponse<null>> {
    await this.authService.esqueciSenha(dto.email);
    return buildResponse(null, 'Se o e-mail existir em nossa base, enviamos as instruções de redefinição.');
  }

  @Public()
  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefine a senha a partir do token recebido por e-mail' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso.' })
  async redefinirSenha(@Body() dto: ResetPasswordDto): Promise<ControllerResponse<null>> {
    await this.authService.redefinirSenha(dto.token, dto.novaSenha);
    return buildResponse(null, 'Senha redefinida com sucesso. Faça login com sua nova senha.');
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Inicia o fluxo de login com Google' })
  async googleAuth(): Promise<void> {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback chamado pelo Google após o consentimento' })
  async googleCallback(@Req() req: { user: GoogleUserPayload }, @Res() res: Response): Promise<void> {
    try {
      const resultado = await this.authService.loginComGoogle({
        email: req.user.email,
        nome: req.user.nome,
      });

      const params = new URLSearchParams({
        accessToken: resultado.accessToken,
        refreshToken: resultado.refreshToken,
      });

      res.redirect(`${this.configService.frontendUrl}/oauth/callback?${params.toString()}`);
    } catch {
      res.redirect(`${this.configService.frontendUrl}/login?erro=google`);
    }
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
