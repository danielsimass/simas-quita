import { describe, expect, it } from 'vitest';
import { InstallmentStatus } from '@simas-quita/shared-financing-types';
import {
  applyBackwardPrepayment,
  buildSchedule,
  computeMetrics,
} from './financial-calculator.service';

describe('FinancialCalculatorService', () => {
  it('builds flat schedule with fixed installment amounts', () => {
    const schedule = buildSchedule({
      installmentCount: 36,
      installmentAmount: 1800,
      firstDueDate: '2024-01-15',
    });

    expect(schedule).toHaveLength(36);
    schedule.forEach((installment) => {
      expect(installment.amount).toBe(1800);
      expect(installment.status).toBe(InstallmentStatus.PENDING);
    });
  });

  it('applies backward prepayment from last unpaid installments', () => {
    const schedule = buildSchedule({
      installmentCount: 36,
      installmentAmount: 1800,
      firstDueDate: '2024-01-15',
    });

    const result = applyBackwardPrepayment({
      schedule,
      prepayment: {
        id: '1',
        date: '2024-06-10',
        amount: 1900,
        installmentCount: 2,
      },
      standardInstallmentAmount: 1800,
    });

    expect(result.paidInstallmentNumbers).toEqual([36, 35]);
    expect(result.discount).toBe(1700);
    expect(result.remainingBalance).toBe(34 * 1800);

    const paid36 = result.schedule.find((item) => item.number === 36);
    const paid35 = result.schedule.find((item) => item.number === 35);

    expect(paid36?.status).toBe(InstallmentStatus.PAID);
    expect(paid35?.status).toBe(InstallmentStatus.PAID);
    expect(paid36?.amount).toBe(950);
    expect(paid35?.amount).toBe(950);
  });

  it('computes dashboard metrics for simplified financing', () => {
    const schedule = buildSchedule({
      installmentCount: 36,
      installmentAmount: 2000,
      firstDueDate: '2024-01-15',
    });

    const afterPrepayment = applyBackwardPrepayment({
      schedule,
      prepayment: {
        id: '1',
        date: '2024-06-10',
        amount: 3800,
        installmentCount: 2,
      },
      standardInstallmentAmount: 2000,
    });

    const metrics = computeMetrics({
      financedAmount: 45000,
      installmentCount: 36,
      installmentAmount: 2000,
      firstDueDate: '2024-01-15',
      schedule: afterPrepayment.schedule,
      prepayments: [
        {
          id: '1',
          date: '2024-06-10',
          amount: 3800,
          installmentCount: 2,
        },
      ],
    });

    expect(metrics.totalToPay).toBe('72000.00');
    expect(metrics.remainingBalance).toBe('68000.00');
    expect(metrics.totalDiscount).toBe('200.00');
    expect(metrics.remainingInstallments).toBe(34);
  });
});
