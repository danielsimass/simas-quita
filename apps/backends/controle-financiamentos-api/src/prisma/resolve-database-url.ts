import { existsSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

const API_ROOT = join(__dirname, '..', '..');

export function resolveDatabaseUrl(databaseUrl: string): string {
  if (!databaseUrl.startsWith('file:')) {
    return databaseUrl;
  }

  const rawPath = databaseUrl.replace(/^file:/, '');

  if (isAbsolute(rawPath)) {
    ensureDirectory(rawPath);
    return `file:${rawPath}`;
  }

  const candidates = [
    join(process.cwd(), rawPath),
    join(API_ROOT, rawPath),
    join(API_ROOT, 'prisma', 'dev.db'),
  ];

  const resolvedPath = candidates.find((candidate) => existsSync(dirname(candidate)))
    ?? join(API_ROOT, 'prisma', 'dev.db');

  ensureDirectory(resolvedPath);
  return `file:${resolvedPath}`;
}

function ensureDirectory(databaseFilePath: string): void {
  mkdirSync(dirname(databaseFilePath), { recursive: true });
}
