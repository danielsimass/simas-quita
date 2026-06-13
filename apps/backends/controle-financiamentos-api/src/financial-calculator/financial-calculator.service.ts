import { InstallmentStatus } from '@simas-quita/shared-financing-types';
import {
  addMonths,
  formatDateIso,
  parseDateIso,
  parseMoney,
  roundHalfUp,
  toMoneyString,
} from '../common/utils/money.util';

export interface InstallmentDraft {
  number: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  paidAt: string | null;
}

export interface ScheduleInput {
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  paidInstallments?: InstallmentDraft[];
}

export interface PrepaymentSnapshot {
  id: string;
  date: string;
  amount: number;
  installmentCount: number;
}

export interface PrepaymentImpactInput {
  schedule: InstallmentDraft[];
  prepayment: PrepaymentSnapshot;
  standardInstallmentAmount: number;
}

export interface PrepaymentImpactResult {
  schedule: InstallmentDraft[];
  discount: number;
  remainingBalance: number;
  paidInstallmentNumbers: number[];
}

export interface MetricsInput {
  financedAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  schedule: InstallmentDraft[];
  prepayments: PrepaymentSnapshot[];
}

export interface FinancingMetrics {
  financedAmount: string;
  totalInstallments: number;
  remainingInstallments: number;
  installmentAmount: string;
  totalToPay: string;
  remainingBalance: string;
  totalPaid: string;
  totalPrepaid: string;
  totalDiscount: string;
  paidInstallments: number;
  percentPaidOff: string;
  estimatedPayoffDate: string | null;
  originalPayoffDate: string | null;
  debtEvolution: Array<{ date: string; value: string }>;
  monthlyPayments: Array<{ date: string; value: string }>;
  monthlyPrepayments: Array<{ date: string; value: string }>;
  accumulatedDiscount: string;
}

export function buildSchedule(input: ScheduleInput): InstallmentDraft[] {
  const firstDueDate = parseDateIso(input.firstDueDate);
  const schedule: InstallmentDraft[] = [];

  for (let number = 1; number <= input.installmentCount; number += 1) {
    const dueDate = formatDateIso(addMonths(firstDueDate, number - 1));

    schedule.push({
      number,
      amount: roundHalfUp(input.installmentAmount),
      dueDate,
      status: InstallmentStatus.PENDING,
      paidAt: null,
    });
  }

  return mergePaidInstallments(schedule, input.paidInstallments);
}

function mergePaidInstallments(
  schedule: InstallmentDraft[],
  paidInstallments: InstallmentDraft[] = [],
): InstallmentDraft[] {
  const paidByNumber = new Map(paidInstallments.map((item) => [item.number, item]));

  return schedule.map((installment) => {
    const paid = paidByNumber.get(installment.number);
    if (!paid) {
      return installment;
    }

    return {
      ...installment,
      status: InstallmentStatus.PAID,
      paidAt: paid.paidAt,
      amount: paid.amount,
      dueDate: paid.dueDate,
    };
  });
}

function splitAmountAcrossInstallments(
  totalAmount: number,
  count: number,
): number[] {
  const baseAmount = roundHalfUp(totalAmount / count, 2);
  const amounts = Array.from({ length: count }, () => baseAmount);
  const distributed = roundHalfUp(baseAmount * count);
  const remainder = roundHalfUp(totalAmount - distributed);

  if (remainder !== 0 && amounts.length > 0) {
    amounts[0] = roundHalfUp(amounts[0] + remainder);
  }

  return amounts;
}

export function applyBackwardPrepayment(
  input: PrepaymentImpactInput,
): PrepaymentImpactResult {
  const pendingInstallments = input.schedule
    .filter((item) => item.status === InstallmentStatus.PENDING)
    .sort((left, right) => right.number - left.number);

  const installmentsToPay = pendingInstallments.slice(
    0,
    input.prepayment.installmentCount,
  );

  if (installmentsToPay.length === 0) {
    return {
      schedule: input.schedule,
      discount: 0,
      remainingBalance: sumPendingAmount(input.schedule),
      paidInstallmentNumbers: [],
    };
  }

  const expectedTotal = roundHalfUp(
    installmentsToPay.length * input.standardInstallmentAmount,
  );
  const discount = roundHalfUp(Math.max(expectedTotal - input.prepayment.amount, 0));
  const paidAmounts = splitAmountAcrossInstallments(
    input.prepayment.amount,
    installmentsToPay.length,
  );
  const paidByNumber = new Map<number, number>();

  installmentsToPay.forEach((installment, index) => {
    paidByNumber.set(installment.number, paidAmounts[index]);
  });

  const updatedSchedule = input.schedule.map((installment) => {
    const paidAmount = paidByNumber.get(installment.number);
    if (paidAmount === undefined) {
      return installment;
    }

    return {
      ...installment,
      amount: paidAmount,
      status: InstallmentStatus.PAID,
      paidAt: input.prepayment.date,
    };
  });

  return {
    schedule: updatedSchedule,
    discount,
    remainingBalance: sumPendingAmount(updatedSchedule),
    paidInstallmentNumbers: installmentsToPay.map((item) => item.number),
  };
}

function sumPendingAmount(schedule: InstallmentDraft[]): number {
  return schedule
    .filter((item) => item.status === InstallmentStatus.PENDING)
    .reduce((total, item) => total + item.amount, 0);
}

export function computeMetrics(input: MetricsInput): FinancingMetrics {
  const pendingInstallments = input.schedule.filter(
    (item) => item.status === InstallmentStatus.PENDING,
  );
  const paidInstallments = input.schedule.filter(
    (item) => item.status === InstallmentStatus.PAID,
  );
  const totalToPay = roundHalfUp(input.installmentCount * input.installmentAmount);
  const remainingBalance = sumPendingAmount(input.schedule);
  const totalPaid = paidInstallments.reduce((total, item) => total + item.amount, 0);
  const totalPrepaid = input.prepayments.reduce(
    (total, prepayment) => total + prepayment.amount,
    0,
  );
  const totalDiscount = roundHalfUp(
    Math.max(totalToPay - remainingBalance - totalPaid, 0),
  );

  const originalPayoffDate = formatDateIso(
    addMonths(parseDateIso(input.firstDueDate), input.installmentCount - 1),
  );
  const estimatedPayoffDate = pendingInstallments.at(-1)?.dueDate ?? null;
  const percentPaidOff = totalToPay === 0
    ? '0.00'
    : toMoneyString(((totalToPay - remainingBalance) / totalToPay) * 100);

  return {
    financedAmount: toMoneyString(input.financedAmount),
    totalInstallments: input.installmentCount,
    remainingInstallments: pendingInstallments.length,
    installmentAmount: toMoneyString(input.installmentAmount),
    totalToPay: toMoneyString(totalToPay),
    remainingBalance: toMoneyString(remainingBalance),
    totalPaid: toMoneyString(totalPaid),
    totalPrepaid: toMoneyString(totalPrepaid),
    totalDiscount: toMoneyString(totalDiscount),
    paidInstallments: paidInstallments.length,
    percentPaidOff,
    estimatedPayoffDate,
    originalPayoffDate,
    debtEvolution: buildDebtEvolution(input.schedule, input.prepayments),
    monthlyPayments: buildMonthlyPayments(input.schedule),
    monthlyPrepayments: buildMonthlyPrepayments(input.prepayments),
    accumulatedDiscount: toMoneyString(totalDiscount),
  };
}

function buildDebtEvolution(
  schedule: InstallmentDraft[],
  prepayments: PrepaymentSnapshot[],
): Array<{ date: string; value: string }> {
  const points: Array<{ date: string; value: string }> = [];
  let runningBalance = schedule.reduce((total, item) => total + item.amount, 0);

  schedule.forEach((installment) => {
    points.push({
      date: installment.dueDate,
      value: toMoneyString(runningBalance),
    });

    if (installment.status === InstallmentStatus.PAID) {
      runningBalance = roundHalfUp(runningBalance - installment.amount);
    }
  });

  prepayments.forEach((prepayment) => {
    points.push({
      date: prepayment.date,
      value: toMoneyString(prepayment.amount),
    });
  });

  return points.sort((left, right) => left.date.localeCompare(right.date));
}

function buildMonthlyPayments(
  schedule: InstallmentDraft[],
): Array<{ date: string; value: string }> {
  return schedule
    .filter((item) => item.status === InstallmentStatus.PAID)
    .map((item) => ({
      date: item.paidAt ?? item.dueDate,
      value: toMoneyString(item.amount),
    }));
}

function buildMonthlyPrepayments(
  prepayments: PrepaymentSnapshot[],
): Array<{ date: string; value: string }> {
  return prepayments.map((prepayment) => ({
    date: prepayment.date,
    value: toMoneyString(prepayment.amount),
  }));
}

export function rebuildScheduleWithPrepayments(input: {
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  manuallyPaidInstallments: InstallmentDraft[];
  prepayments: PrepaymentSnapshot[];
}): InstallmentDraft[] {
  let schedule = buildSchedule({
    installmentCount: input.installmentCount,
    installmentAmount: input.installmentAmount,
    firstDueDate: input.firstDueDate,
    paidInstallments: input.manuallyPaidInstallments,
  });

  for (const prepayment of input.prepayments) {
    const impact = applyBackwardPrepayment({
      schedule,
      prepayment,
      standardInstallmentAmount: input.installmentAmount,
    });
    schedule = impact.schedule;
  }

  return schedule;
}

export { parseMoney, toMoneyString };
