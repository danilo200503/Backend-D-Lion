import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(currentUser: AuthenticatedUser): Promise<ControllerResponse<UserProfileDto>>;
    updateProfile(currentUser: AuthenticatedUser, dto: UpdateProfileDto): Promise<ControllerResponse<UserProfileDto>>;
    changePassword(currentUser: AuthenticatedUser, dto: ChangePasswordDto): Promise<ControllerResponse<null>>;
    uploadAvatar(currentUser: AuthenticatedUser, file: Express.Multer.File): Promise<ControllerResponse<UserProfileDto>>;
}
