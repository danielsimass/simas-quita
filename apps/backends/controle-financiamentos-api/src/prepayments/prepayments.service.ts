import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePrepaymentInput,
  InstallmentStatus,
  PrepaymentDto,
  UpdatePrepaymentInput,
} from '@simas-quita/shared-financing-types';
import {
  mapDraftsToCreateManyInput,
  mapInstallmentsToDrafts,
  mapPrepaymentsToSnapshots,
  parsePaidInstallmentNumbers,
  serializePaidInstallmentNumbers,
} from '../common/helpers/schedule-persistence.helper';
import { formatDateIso, parseMoney } from '../common/utils/money.util';
import { FinancialCalculatorService } from '../financial-calculator/financial-calculator.module';
import { mapPrepaymentToDto, toPrismaDate } from '../mappers/financing.mapper';
import { FinancingsService } from '../financings/financings.service';
import { InstallmentRepository } from '../repositories/installment.repository';
import { PrepaymentRepository } from '../repositories/prepayment.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrepaymentsService {
  constructor(
    private readonly prepaymentRepository: PrepaymentRepository,
    private readonly installmentRepository: InstallmentRepository,
    private readonly financingsService: FinancingsService,
    private readonly calculator: FinancialCalculatorService,
    private readonly prisma: PrismaService,
  ) {}

  async findByFinancing(
    financingId: string,
    userId: string,
  ): Promise<PrepaymentDto[]> {
    await this.financingsService.getFinancingEntity(financingId, userId);

    const prepayments = await this.prepaymentRepository.findByFinancingForUser(
      financingId,
      userId,
    );

    return prepayments.map(mapPrepaymentToDto);
  }

  async create(
    financingId: string,
    userId: string,
    input: CreatePrepaymentInput,
  ): Promise<PrepaymentDto> {
    const financing = await this.financingsService.getFinancingEntity(
      financingId,
      userId,
    );

    const installments = await this.installmentRepository.findByFinancingForUser(
      financingId,
      userId,
    );
    const schedule = mapInstallmentsToDrafts(installments);
    const standardInstallmentAmount = parseMoney(financing.installmentAmount.toString());

    const impact = this.calculator.applyBackwardPrepayment({
      schedule,
      prepayment: {
        id: 'draft',
        date: input.date,
        amount: parseMoney(input.amount),
        installmentCount: input.installmentCount,
      },
      standardInstallmentAmount,
    });

    const prepayment = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.prepayment.create({
        data: {
          financing: { connect: { id: financingId } },
          date: toPrismaDate(input.date),
          amount: input.amount,
          installmentCount: input.installmentCount,
          discount: impact.discount.toFixed(2),
          paidInstallmentNumbers: serializePaidInstallmentNumbers(
            impact.paidInstallmentNumbers,
          ),
          remainingBalanceAfter: impact.remainingBalance.toFixed(2),
        },
      });

      await transaction.installment.deleteMany({ where: { financingId } });
      const rows = mapDraftsToCreateManyInput(financingId, impact.schedule);

      if (rows.length > 0) {
        await transaction.installment.createMany({ data: rows });
      }

      return created;
    });

    return mapPrepaymentToDto(prepayment);
  }

  async update(
    id: string,
    userId: string,
    input: UpdatePrepaymentInput,
  ): Promise<PrepaymentDto> {
    const existing = await this.prepaymentRepository.findByIdForUser(id, userId);

    if (!existing) {
      throw new NotFoundException('Prepayment not found');
    }

    const mergedInput: CreatePrepaymentInput = {
      date: input.date ?? formatDateIso(existing.date),
      amount: input.amount ?? existing.amount.toString(),
      installmentCount: input.installmentCount ?? existing.installmentCount,
    };

    await this.prepaymentRepository.delete(id, userId);
    await this.rebuildScheduleFromPrepayments(existing.financingId, userId);

    return this.create(existing.financingId, userId, mergedInput);
  }

  async delete(id: string, userId: string): Promise<void> {
    const prepayment = await this.prepaymentRepository.findByIdForUser(id, userId);

    if (!prepayment) {
      throw new NotFoundException('Prepayment not found');
    }

    const financingId = prepayment.financingId;
    const allPrepayments = await this.prepaymentRepository.findByFinancingForUser(
      financingId,
      userId,
    );
    const currentInstallments = await this.installmentRepository.findByFinancingForUser(
      financingId,
      userId,
    );

    const allPrepaymentNumbers = new Set(
      allPrepayments.flatMap((item) =>
        parsePaidInstallmentNumbers(item.paidInstallmentNumbers),
      ),
    );

    const manuallyPaidInstallments = mapInstallmentsToDrafts(currentInstallments).filter(
      (item) => item.status === InstallmentStatus.PAID && !allPrepaymentNumbers.has(item.number),
    );

    await this.prepaymentRepository.delete(id, userId);

    const remainingPrepayments = allPrepayments.filter((item) => item.id !== id);
    await this.applyRebuiltSchedule(
      financingId,
      userId,
      manuallyPaidInstallments,
      remainingPrepayments,
    );
  }

  private async rebuildScheduleFromPrepayments(
    financingId: string,
    userId: string,
  ): Promise<void> {
    const prepayments = await this.prepaymentRepository.findByFinancingForUser(
      financingId,
      userId,
    );
    const currentInstallments = await this.installmentRepository.findByFinancingForUser(
      financingId,
      userId,
    );

    const prepaymentNumbers = new Set(
      prepayments.flatMap((prepayment) =>
        parsePaidInstallmentNumbers(prepayment.paidInstallmentNumbers),
      ),
    );

    const manuallyPaidInstallments = mapInstallmentsToDrafts(currentInstallments).filter(
      (item) => item.status === InstallmentStatus.PAID && !prepaymentNumbers.has(item.number),
    );

    await this.applyRebuiltSchedule(
      financingId,
      userId,
      manuallyPaidInstallments,
      prepayments,
    );
  }

  private async applyRebuiltSchedule(
    financingId: string,
    userId: string,
    manuallyPaidInstallments: ReturnType<typeof mapInstallmentsToDrafts>,
    prepayments: Awaited<ReturnType<PrepaymentRepository['findByFinancingForUser']>>,
  ): Promise<void> {
    const financing = await this.financingsService.getFinancingEntity(
      financingId,
      userId,
    );

    const schedule = this.calculator.rebuildScheduleWithPrepayments({
      installmentCount: financing.installmentCount,
      installmentAmount: parseMoney(financing.installmentAmount.toString()),
      firstDueDate: formatDateIso(financing.firstDueDate),
      manuallyPaidInstallments,
      prepayments: mapPrepaymentsToSnapshots(prepayments),
    });

    const rows = mapDraftsToCreateManyInput(financingId, schedule);
    await this.installmentRepository.replaceForFinancing(financingId, rows);
  }
}
