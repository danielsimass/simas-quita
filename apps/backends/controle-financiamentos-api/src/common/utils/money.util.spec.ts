import { describe, expect, it } from 'vitest';
import { parseMoney, roundHalfUp, toMoneyString } from './money.util.js';

describe('money util', () => {
  it('rounds half up to two decimals', () => {
    expect(roundHalfUp(1.005, 2)).toBe(1.01);
    expect(toMoneyString(1791.525)).toBe('1791.53');
  });

  it('parses decimal strings', () => {
    expect(parseMoney('45000.00')).toBe(45000);
    expect(toMoneyString(parseMoney('1791.53'))).toBe('1791.53');
  });
});
