import { Installment, Prepayment } from '../../prisma/client';
import { Prisma } from '../../prisma/client';
import { InstallmentStatus } from '@simas-quita/shared-financing-types';
import { InstallmentDraft } from '../../financial-calculator/financial-calculator.service';
import { formatDateIso } from '../utils/money.util';

export function mapInstallmentsToDrafts(installments: Installment[]): InstallmentDraft[] {
  return installments.map((installment) => ({
    number: installment.number,
    amount: Number.parseFloat(installment.amount.toString()),
    dueDate: formatDateIso(installment.dueDate),
    status: installment.status as InstallmentStatus,
    paidAt: installment.paidAt ? installment.paidAt.toISOString() : null,
  }));
}

export function mapDraftsToCreateManyInput(
  financingId: string,
  drafts: InstallmentDraft[],
): Prisma.InstallmentCreateManyInput[] {
  return drafts.map((draft) => ({
    financingId,
    number: draft.number,
    amount: draft.amount.toFixed(2),
    dueDate: `${draft.dueDate}T00:00:00.000Z`,
    status: draft.status,
    paidAt: draft.paidAt ? new Date(draft.paidAt) : null,
  }));
}

export function mapPrepaymentsToSnapshots(prepayments: Prepayment[]) {
  return prepayments.map((prepayment) => ({
    id: prepayment.id,
    date: formatDateIso(prepayment.date),
    amount: Number.parseFloat(prepayment.amount.toString()),
    installmentCount: prepayment.installmentCount,
  }));
}

export function parsePaidInstallmentNumbers(value: string): number[] {
  return JSON.parse(value) as number[];
}

export function serializePaidInstallmentNumbers(numbers: number[]): string {
  return JSON.stringify(numbers);
}
