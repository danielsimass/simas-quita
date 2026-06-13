import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const apiRoot = __dirname;
const monorepoRoot = join(apiRoot, '../../..');

for (const envPath of [
  join(monorepoRoot, '.env'),
  join(apiRoot, '.env'),
]) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
