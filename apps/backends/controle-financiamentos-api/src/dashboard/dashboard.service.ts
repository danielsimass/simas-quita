import { Injectable } from '@nestjs/common';
import { DashboardDto } from '@simas-quita/shared-financing-types';
import {
  mapInstallmentsToDrafts,
  mapPrepaymentsToSnapshots,
} from '../common/helpers/schedule-persistence.helper';
import { formatDateIso, parseMoney } from '../common/utils/money.util';
import { FinancialCalculatorService } from '../financial-calculator/financial-calculator.module';
import { mapFinancingToDto } from '../mappers/financing.mapper';
import { FinancingsService } from '../financings/financings.service';
import { InstallmentRepository } from '../repositories/installment.repository';
import { PrepaymentRepository } from '../repositories/prepayment.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly financingsService: FinancingsService,
    private readonly installmentRepository: InstallmentRepository,
    private readonly prepaymentRepository: PrepaymentRepository,
    private readonly calculator: FinancialCalculatorService,
  ) {}

  async getDashboard(financingId: string, userId: string): Promise<DashboardDto> {
    const financing = await this.financingsService.getFinancingEntity(
      financingId,
      userId,
    );
    const installments = await this.installmentRepository.findByFinancingForUser(
      financingId,
      userId,
    );
    const prepayments = await this.prepaymentRepository.findByFinancingForUser(
      financingId,
      userId,
    );

    const installmentAmount = parseMoney(financing.installmentAmount.toString());

    const metrics = this.calculator.computeMetrics({
      financedAmount: parseMoney(financing.financedAmount.toString()),
      installmentCount: financing.installmentCount,
      installmentAmount,
      firstDueDate: formatDateIso(financing.firstDueDate),
      schedule: mapInstallmentsToDrafts(installments),
      prepayments: mapPrepaymentsToSnapshots(prepayments),
    });

    return {
      financing: mapFinancingToDto(financing),
      kpis: {
        financedAmount: metrics.financedAmount,
        totalInstallments: metrics.totalInstallments,
        remainingInstallments: metrics.remainingInstallments,
        installmentAmount: metrics.installmentAmount,
        totalToPay: metrics.totalToPay,
        remainingBalance: metrics.remainingBalance,
        totalPaid: metrics.totalPaid,
        totalPrepaid: metrics.totalPrepaid,
        totalDiscount: metrics.totalDiscount,
        paidInstallments: metrics.paidInstallments,
        percentPaidOff: metrics.percentPaidOff,
        estimatedPayoffDate: metrics.estimatedPayoffDate,
        originalPayoffDate: metrics.originalPayoffDate,
      },
      debtEvolution: metrics.debtEvolution,
      monthlyPayments: metrics.monthlyPayments,
      monthlyPrepayments: metrics.monthlyPrepayments,
      insights: {
        totalDiscount: metrics.accumulatedDiscount,
        remainingBalance: metrics.remainingBalance,
        percentPaidOff: metrics.percentPaidOff,
      },
    };
  }
}
