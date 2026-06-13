import { describe, expect, it } from 'vitest';
import { InstallmentStatus } from './enums';

describe('shared enums', () => {
  it('exports installment status values', () => {
    expect(InstallmentStatus.PENDING).toBe('PENDING');
    expect(InstallmentStatus.PAID).toBe('PAID');
  });
});
