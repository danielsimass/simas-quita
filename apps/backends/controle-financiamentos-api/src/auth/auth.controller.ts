import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserDto } from '@simas-quita/shared-financing-types';
import { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedUser } from './jwt.strategy';
import { AuthService } from './auth.service';
import { LoginDto, UpdateProfileDto } from './auth.dto';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: UserDto }> {
    const result = await this.authService.login(body);
    this.setAuthCookies(response, result.tokens);
    return { user: result.user };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ status: string }> {
    const tokens = await this.authService.refresh(request.cookies?.refresh_token);
    this.setAuthCookies(response, tokens);
    return { status: 'ok' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(request.cookies?.refresh_token);
    this.clearAuthCookies(response);
  }

  @Get('me')
  async me(@Req() request: AuthenticatedRequest): Promise<UserDto> {
    return this.authService.getMe(request.user.userId);
  }

  @Post('profile')
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ): Promise<UserDto> {
    return this.authService.updateProfile(request.user.userId, body);
  }

  private setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ): void {
    const accessCookie = this.authService.getAccessCookieOptions(tokens.accessToken);
    const refreshCookie = this.authService.getRefreshCookieOptions(tokens.refreshToken);
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie(accessCookie.name, accessCookie.value, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: accessCookie.maxAge,
    });

    response.cookie(refreshCookie.name, refreshCookie.value, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: refreshCookie.maxAge,
    });
  }

  private clearAuthCookies(response: Response): void {
    const cookieNames = this.authService.getClearCookieOptions();
    const isProduction = process.env.NODE_ENV === 'production';

    cookieNames.forEach((name) => {
      response.clearCookie(name, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
      });
    });
  }
}
