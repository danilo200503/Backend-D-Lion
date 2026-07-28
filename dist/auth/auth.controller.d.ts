import type { Response } from 'express';
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
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { AppConfigService } from '../config/app-config.service';
import { GoogleUserPayload } from './strategies/google.strategy';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    private readonly configService;
    constructor(authService: AuthService, usersService: UsersService, configService: AppConfigService);
    register(dto: RegisterDto): Promise<ControllerResponse<RegisterResponseDto>>;
    verificarEmail(dto: VerifyEmailDto): Promise<ControllerResponse<AuthResponseDto>>;
    reenviarVerificacao(dto: ResendVerificationDto): Promise<ControllerResponse<null>>;
    esqueciSenha(dto: ForgotPasswordDto): Promise<ControllerResponse<null>>;
    redefinirSenha(dto: ResetPasswordDto): Promise<ControllerResponse<null>>;
    googleAuth(): Promise<void>;
    googleCallback(req: {
        user: GoogleUserPayload;
    }, res: Response): Promise<void>;
    login(dto: LoginDto): Promise<ControllerResponse<AuthResponseDto>>;
    refresh(dto: RefreshTokenDto): Promise<ControllerResponse<AuthResponseDto>>;
    me(currentUser: AuthenticatedUser): Promise<ControllerResponse<UserProfileDto>>;
    logout(dto: RefreshTokenDto): Promise<ControllerResponse<null>>;
}
