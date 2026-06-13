import { describe, expect, it } from 'vitest';
import { createCorsOriginValidator, isAllowedCorsOrigin } from './cors-origin.util.js';

describe('cors origin util', () => {
  const allowedDomain = 'danielsimas.com.br';

  it('allows the apex domain and any subdomain over https', () => {
    expect(
      isAllowedCorsOrigin('https://danielsimas.com.br', {
        allowedDomain,
        production: true,
      }),
    ).toBe(true);
    expect(
      isAllowedCorsOrigin('https://controle.danielsimas.com.br', {
        allowedDomain,
        production: true,
      }),
    ).toBe(true);
    expect(
      isAllowedCorsOrigin('https://app.staging.danielsimas.com.br', {
        allowedDomain,
        production: true,
      }),
    ).toBe(true);
  });

  it('rejects lookalike domains and non-https origins in production', () => {
    expect(
      isAllowedCorsOrigin('https://danielsimas.com.br.evil.com', {
        allowedDomain,
        production: true,
      }),
    ).toBe(false);
    expect(
      isAllowedCorsOrigin('http://controle.danielsimas.com.br', {
        allowedDomain,
        production: true,
      }),
    ).toBe(false);
  });

  it('allows http origins in non-production', () => {
    expect(
      isAllowedCorsOrigin('http://controle.danielsimas.com.br', {
        allowedDomain,
        production: false,
      }),
    ).toBe(true);
  });

  it('allows extra origins configured for local development', () => {
    const validateOrigin = createCorsOriginValidator({
      allowedDomain,
      extraOrigins: ['http://localhost:5173'],
      production: true,
    });

    validateOrigin('http://localhost:5173', (error, allow) => {
      expect(error).toBeNull();
      expect(allow).toBe('http://localhost:5173');
    });

    validateOrigin('https://evil.example.com', (error) => {
      expect(error).toBeInstanceOf(Error);
    });
  });
});
