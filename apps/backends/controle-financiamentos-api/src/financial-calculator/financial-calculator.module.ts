import { Injectable, Module } from '@nestjs/common';
import {
  applyBackwardPrepayment,
  buildSchedule,
  computeMetrics,
  rebuildScheduleWithPrepayments,
} from './financial-calculator.service';

export {
  applyBackwardPrepayment,
  buildSchedule,
  computeMetrics,
  rebuildScheduleWithPrepayments,
  type FinancingMetrics,
  type InstallmentDraft,
  type MetricsInput,
  type PrepaymentImpactInput,
  type PrepaymentImpactResult,
  type PrepaymentSnapshot,
  type ScheduleInput,
} from './financial-calculator.service';

@Injectable()
export class FinancialCalculatorService {
  buildSchedule = buildSchedule;
  applyBackwardPrepayment = applyBackwardPrepayment;
  computeMetrics = computeMetrics;
  rebuildScheduleWithPrepayments = rebuildScheduleWithPrepayments;
}

@Module({
  providers: [FinancialCalculatorService],
  exports: [FinancialCalculatorService],
})
export class FinancialCalculatorModule {}
