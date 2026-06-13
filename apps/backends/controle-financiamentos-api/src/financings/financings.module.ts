import { Module } from '@nestjs/common';
import { FinancialCalculatorModule } from '../financial-calculator/financial-calculator.module';
import { FinancingRepository } from '../repositories/financing.repository';
import { InstallmentRepository } from '../repositories/installment.repository';
import { FinancingsController } from './financings.controller';
import { FinancingsService } from './financings.service';

@Module({
  imports: [FinancialCalculatorModule],
  controllers: [FinancingsController],
  providers: [
    FinancingsService,
    FinancingRepository,
    InstallmentRepository,
  ],
  exports: [FinancingsService],
})
export class FinancingsModule {}
