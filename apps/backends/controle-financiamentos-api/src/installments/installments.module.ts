import { Module } from '@nestjs/common';
import { FinancialCalculatorModule } from '../financial-calculator/financial-calculator.module';
import { FinancingsModule } from '../financings/financings.module';
import { InstallmentRepository } from '../repositories/installment.repository';
import { InstallmentsController } from './installments.controller';
import { InstallmentsService } from './installments.service';

@Module({
  imports: [FinancialCalculatorModule, FinancingsModule],
  controllers: [InstallmentsController],
  providers: [InstallmentsService, InstallmentRepository],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
