import {
  Financing,
  Installment,
  Prepayment,
} from '../prisma/client';
import {
  FinancingDto,
  InstallmentDto,
  InstallmentStatus,
  PrepaymentDto,
  UserDto,
} from '@simas-quita/shared-financing-types';
import { User } from '../prisma/client';
import { formatDateIso, parseDateIso } from '../common/utils/money.util';
import { parsePaidInstallmentNumbers } from '../common/helpers/schedule-persistence.helper';

function decimalToString(value: { toString(): string }): string {
  return Number.parseFloat(value.toString()).toFixed(2);
}

export function mapUserToDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileSetupCompleted: user.profileSetupCompleted,
    createdAt: user.createdAt.toISOString(),
  };
}

export function mapFinancingToDto(financing: Financing): FinancingDto {
  return {
    id: financing.id,
    userId: financing.userId,
    name: financing.name,
    institution: financing.institution,
    financedAmount: decimalToString(financing.financedAmount),
    installmentCount: financing.installmentCount,
    installmentAmount: decimalToString(financing.installmentAmount),
    firstDueDate: formatDateIso(financing.firstDueDate),
    notes: financing.notes,
    createdAt: financing.createdAt.toISOString(),
  };
}

export function mapInstallmentToDto(installment: Installment): InstallmentDto {
  return {
    id: installment.id,
    financingId: installment.financingId,
    number: installment.number,
    amount: decimalToString(installment.amount),
    dueDate: formatDateIso(installment.dueDate),
    status: installment.status as InstallmentStatus,
    paidAt: installment.paidAt ? installment.paidAt.toISOString() : null,
  };
}

export function mapPrepaymentToDto(prepayment: Prepayment): PrepaymentDto {
  return {
    id: prepayment.id,
    financingId: prepayment.financingId,
    date: formatDateIso(prepayment.date),
    amount: decimalToString(prepayment.amount),
    installmentCount: prepayment.installmentCount,
    discount: decimalToString(prepayment.discount),
    paidInstallmentNumbers: parsePaidInstallmentNumbers(prepayment.paidInstallmentNumbers),
    remainingBalanceAfter: decimalToString(prepayment.remainingBalanceAfter),
  };
}

export function toPrismaDate(value: string): Date {
  return parseDateIso(value);
}
