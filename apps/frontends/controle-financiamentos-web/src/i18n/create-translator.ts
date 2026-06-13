import { ptBR, type TranslationMessages } from './locales/pt-BR';

type TranslationParams = Record<string, string | number>;

function resolvePath(messages: TranslationMessages, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = messages;

  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) {
    return text;
  }

  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

export function createTranslator(messages: TranslationMessages = ptBR) {
  return function translate(path: string, params?: TranslationParams): string {
    const resolved = resolvePath(messages, path);
    if (!resolved) {
      return path;
    }
    return interpolate(resolved, params);
  };
}

export const translate = createTranslator();
