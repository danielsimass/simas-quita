import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';

const BCRYPT_ROUNDS = 10;
const DEFAULT_USER_EMAIL = 'admin@local.dev';
const DEFAULT_USER_PASSWORD = 'changeme123';
const DEFAULT_USER_NAME = 'Admin';

@Injectable()
export class DefaultUserSeedService implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const userCount = await this.userRepository.count();

    if (userCount > 0) {
      return;
    }

    const email = this.configService.get<string>('DEFAULT_USER_EMAIL', DEFAULT_USER_EMAIL);
    const password = this.configService.get<string>('DEFAULT_USER_PASSWORD', DEFAULT_USER_PASSWORD);
    const name = this.configService.get<string>('DEFAULT_USER_NAME', DEFAULT_USER_NAME);
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await this.userRepository.save({
      name,
      email: email.toLowerCase(),
      passwordHash,
      profileSetupCompleted: false,
    });
  }
}
