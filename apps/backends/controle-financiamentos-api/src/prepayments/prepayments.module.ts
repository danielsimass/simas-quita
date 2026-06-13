import { Module } from '@nestjs/common';
import { FinancialCalculatorModule } from '../financial-calculator/financial-calculator.module';
import { FinancingsModule } from '../financings/financings.module';
import { InstallmentRepository } from '../repositories/installment.repository';
import { PrepaymentRepository } from '../repositories/prepayment.repository';
import { PrepaymentsController } from './prepayments.controller';
import { PrepaymentsService } from './prepayments.service';

@Module({
  imports: [FinancialCalculatorModule, FinancingsModule],
  controllers: [PrepaymentsController],
  providers: [
    PrepaymentsService,
    PrepaymentRepository,
    InstallmentRepository,
  ],
  exports: [PrepaymentsService],
})
export class PrepaymentsModule {}
