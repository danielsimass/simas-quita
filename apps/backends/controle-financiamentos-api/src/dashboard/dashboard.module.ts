import { Module } from '@nestjs/common';
import { FinancialCalculatorModule } from '../financial-calculator/financial-calculator.module';
import { FinancingsModule } from '../financings/financings.module';
import { InstallmentRepository } from '../repositories/installment.repository';
import { PrepaymentRepository } from '../repositories/prepayment.repository';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [FinancialCalculatorModule, FinancingsModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    InstallmentRepository,
    PrepaymentRepository,
  ],
})
export class DashboardModule {}
