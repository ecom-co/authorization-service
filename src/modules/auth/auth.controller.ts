import { Controller, Logger, UseGuards } from '@nestjs/common';

import { GrpcMethod } from '@ecom-co/grpc';
import { Payload } from '@nestjs/microservices';

import { CurrentSsid } from '@/core/decorators/current-ssid.decorator';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { CheckAccessRequestDto } from '@/modules/auth/dto/check-access.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { GrpcJwtGuard } from '@/modules/auth/guards/grpc-jwt.guard';
import { GrpcRefreshTokenGuard } from '@/modules/auth/guards/grpc-refresh-token.guard';
import { SessionUser } from '@/modules/auth/services/auth-redis.service';
import { AuthService } from '@/modules/auth/services/auth.service';
import { TokenPair } from '@/modules/auth/services/jwt.service';
import { UserResponseDto } from '@/modules/user/dto/user-response.dto';
import { UserService } from '@/modules/user/user.service';

@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @GrpcMethod('AuthService', 'CheckAccess')
    @UseGuards(GrpcJwtGuard)
    async checkAccess(
        @Payload() payload: CheckAccessRequestDto,
        @CurrentUser() user: SessionUser,
    ): Promise<{
        allowed: boolean;
        reason?: string;
        user?: UserResponseDto;
    }> {
        const fullUser = await this.userService.findById(user.id);

        this.logger.log(`Checking access for user ${user.id}`);
        this.logger.log(`Payload: ${JSON.stringify(payload)}`);

        if (!fullUser) {
            return { allowed: false, reason: 'User not found' };
        }

        const userDto = new UserResponseDto(fullUser);

        // Placeholder: allow all authenticated users. Extend with actual permission checks as needed.
        return { allowed: true, reason: 'Access granted', user: userDto };
    }

    @GrpcMethod('AuthService', 'GetProfile')
    @UseGuards(GrpcJwtGuard)
    getProfile(@CurrentUser() user: SessionUser): Promise<{
        message: string;
        user: UserResponseDto;
    }> {
        return this.authService.getProfile(user.id);
    }

    @GrpcMethod('AuthService', 'Login')
    login(@Payload() dto: LoginDto): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        return this.authService.login(dto);
    }

    @GrpcMethod('AuthService', 'RefreshToken')
    @UseGuards(GrpcRefreshTokenGuard)
    refreshToken(@CurrentSsid() ssid: string): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        return this.authService.refreshTokenBySsid(ssid);
    }

    @GrpcMethod('AuthService', 'Register')
    register(@Payload() dto: RegisterDto): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        return this.authService.register(dto);
    }
}
