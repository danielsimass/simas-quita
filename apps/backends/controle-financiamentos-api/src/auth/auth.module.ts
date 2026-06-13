import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DefaultUserSeedService } from './default-user-seed.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    DefaultUserSeedService,
    JwtStrategy,
    UserRepository,
    RefreshTokenRepository,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
