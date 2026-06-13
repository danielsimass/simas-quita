import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatPercent, parseCurrencyInput } from './formatters';

describe('formatters', () => {
  it('formats currency in BRL', () => {
    expect(formatCurrency('1234.56')).toMatch(/R\$\s*1\.234,56/);
    expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
  });

  it('formats dates in pt-BR', () => {
    expect(formatDate('2026-06-10')).toBe('10/06/2026');
  });

  it('formats percent values', () => {
    expect(formatPercent('45.5')).toMatch(/45,5\s*%/);
  });

  it('parses currency input from digits', () => {
    expect(parseCurrencyInput('123456')).toBe('1234.56');
    expect(parseCurrencyInput('')).toBe('0.00');
  });
});
