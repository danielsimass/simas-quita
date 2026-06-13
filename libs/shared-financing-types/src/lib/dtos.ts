import { InstallmentStatus } from './enums.js';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  profileSetupCompleted: boolean;
  createdAt: string;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateFinancingInput {
  name: string;
  institution: string;
  financedAmount: string;
  installmentCount: number;
  installmentAmount: string;
  firstDueDate: string;
  notes?: string | null;
}

export interface UpdateFinancingInput {
  name?: string;
  institution?: string;
  notes?: string | null;
}

export interface InstallmentDto {
  id: string;
  financingId: string;
  number: number;
  amount: string;
  dueDate: string;
  status: InstallmentStatus;
  paidAt: string | null;
}

export interface UpdateInstallmentInput {
  amount?: string;
  dueDate?: string;
  paidAt?: string | null;
}

export interface CreatePrepaymentInput {
  date: string;
  amount: string;
  installmentCount: number;
}

export interface UpdatePrepaymentInput {
  date?: string;
  amount?: string;
  installmentCount?: number;
}

export interface PrepaymentDto {
  id: string;
  financingId: string;
  date: string;
  amount: string;
  installmentCount: number;
  discount: string;
  paidInstallmentNumbers: number[];
  remainingBalanceAfter: string;
}

export interface FinancingDto {
  id: string;
  userId: string;
  name: string;
  institution: string;
  financedAmount: string;
  installmentCount: number;
  installmentAmount: string;
  firstDueDate: string;
  notes: string | null;
  createdAt: string;
}

export interface DashboardKpis {
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
}

export interface TimeSeriesPoint {
  date: string;
  value: string;
}

export interface DashboardInsights {
  totalDiscount: string;
  remainingBalance: string;
  percentPaidOff: string;
}

export interface DashboardDto {
  financing: FinancingDto;
  kpis: DashboardKpis;
  debtEvolution: TimeSeriesPoint[];
  monthlyPayments: TimeSeriesPoint[];
  monthlyPrepayments: TimeSeriesPoint[];
  insights: DashboardInsights;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
