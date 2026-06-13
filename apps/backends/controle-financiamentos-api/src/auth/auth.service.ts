import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../prisma/client';
import { UserDto } from '@simas-quita/shared-financing-types';
import { mapUserToDto } from '../mappers/financing.mapper';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserRepository } from '../repositories/user.repository';
import { LoginDto, UpdateProfileDto } from './auth.dto';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

export interface AuthCookieOptions {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(input: LoginDto): Promise<{ user: UserDto; tokens: AuthCookieOptions }> {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    return {
      user: mapUserToDto(user),
      tokens,
    };
  }

  async refresh(refreshToken: string | undefined): Promise<AuthCookieOptions> {
    const validToken = await this.resolveRefreshToken(refreshToken);

    if (!validToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.revokeById(validToken.id);
    const user = await this.userRepository.findById(validToken.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    const validToken = await this.resolveRefreshToken(refreshToken);

    if (validToken) {
      await this.refreshTokenRepository.revokeById(validToken.id);
    }
  }

  async getMe(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return mapUserToDto(user);
  }

  async updateProfile(userId: string, input: UpdateProfileDto): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const normalizedEmail = input.email.toLowerCase();

    if (normalizedEmail !== user.email) {
      const existing = await this.userRepository.findByEmail(normalizedEmail);

      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = await this.userRepository.update(userId, {
      name: input.name,
      email: normalizedEmail,
      profileSetupCompleted: true,
      ...(input.password
        ? { passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS) }
        : {}),
    });

    return mapUserToDto(updated);
  }

  getAccessCookieOptions(token: string) {
    return {
      name: ACCESS_TOKEN_COOKIE,
      value: token,
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    };
  }

  getRefreshCookieOptions(token: string) {
    return {
      name: REFRESH_TOKEN_COOKIE,
      value: token,
      maxAge: REFRESH_TOKEN_TTL_MS,
    };
  }

  getClearCookieOptions() {
    return [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE];
  }

  private async issueTokens(user: User): Promise<AuthCookieOptions> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    );

    const plainToken = randomBytes(48).toString('hex');
    const tokenHash = await bcrypt.hash(plainToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const storedToken = await this.refreshTokenRepository.save({
      tokenHash,
      expiresAt,
      user: { connect: { id: user.id } },
    });

    return {
      accessToken,
      refreshToken: `${storedToken.id}.${plainToken}`,
    };
  }

  private async resolveRefreshToken(refreshToken: string | undefined) {
    if (!refreshToken) {
      return null;
    }

    const separatorIndex = refreshToken.indexOf('.');
    if (separatorIndex <= 0) {
      return null;
    }

    const tokenId = refreshToken.slice(0, separatorIndex);
    const plainToken = refreshToken.slice(separatorIndex + 1);
    const storedToken = await this.refreshTokenRepository.findActiveById(tokenId);

    if (!storedToken) {
      return null;
    }

    const matches = await bcrypt.compare(plainToken, storedToken.tokenHash);

    if (!matches) {
      return null;
    }

    return storedToken;
  }
}
