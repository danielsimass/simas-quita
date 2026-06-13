import { Injectable, NotFoundException } from '@nestjs/common';
import { Financing } from '../prisma/client';
import {
  CreateFinancingInput,
  FinancingDto,
  UpdateFinancingInput,
} from '@simas-quita/shared-financing-types';
import {
  mapDraftsToCreateManyInput,
  mapInstallmentsToDrafts,
} from '../common/helpers/schedule-persistence.helper';
import { parseMoney } from '../common/utils/money.util';
import { FinancialCalculatorService } from '../financial-calculator/financial-calculator.module';
import { mapFinancingToDto, toPrismaDate } from '../mappers/financing.mapper';
import { FinancingRepository } from '../repositories/financing.repository';
import { InstallmentRepository } from '../repositories/installment.repository';
import { PrismaService } from '../prisma/prisma.service';

const DEMO_FINANCING = {
  name: 'Demo Financing',
  institution: 'Demo Bank',
  financedAmount: '45000.00',
  installmentCount: 36,
  installmentAmount: '1800.00',
  firstDueDate: '2024-01-15',
};

@Injectable()
export class FinancingsService {
  constructor(
    private readonly financingRepository: FinancingRepository,
    private readonly installmentRepository: InstallmentRepository,
    private readonly calculator: FinancialCalculatorService,
    private readonly prisma: PrismaService,
  ) {}

  async findByUser(userId: string): Promise<FinancingDto[]> {
    const financings = await this.financingRepository.findByUser(userId);
    return financings.map(mapFinancingToDto);
  }

  async findByIdForUser(id: string, userId: string): Promise<FinancingDto> {
    const financing = await this.financingRepository.findByIdForUser(id, userId);

    if (!financing) {
      throw new NotFoundException('Financing not found');
    }

    return mapFinancingToDto(financing);
  }

  async create(userId: string, input: CreateFinancingInput): Promise<FinancingDto> {
    const schedule = this.calculator.buildSchedule({
      installmentCount: input.installmentCount,
      installmentAmount: parseMoney(input.installmentAmount),
      firstDueDate: input.firstDueDate,
    });

    const financing = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.financing.create({
        data: {
          user: { connect: { id: userId } },
          name: input.name,
          institution: input.institution,
          financedAmount: input.financedAmount,
          installmentCount: input.installmentCount,
          installmentAmount: input.installmentAmount,
          firstDueDate: toPrismaDate(input.firstDueDate),
          notes: input.notes ?? null,
        },
      });

      const installmentRows = mapDraftsToCreateManyInput(created.id, schedule);
      if (installmentRows.length > 0) {
        await transaction.installment.createMany({ data: installmentRows });
      }

      return created;
    });

    return mapFinancingToDto(financing);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateFinancingInput,
  ): Promise<FinancingDto> {
    const financing = await this.financingRepository.update(id, userId, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.institution ? { institution: input.institution } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });

    if (!financing) {
      throw new NotFoundException('Financing not found');
    }

    return mapFinancingToDto(financing);
  }

  async delete(id: string, userId: string): Promise<void> {
    const financing = await this.financingRepository.delete(id, userId);

    if (!financing) {
      throw new NotFoundException('Financing not found');
    }
  }

  async seedDemo(userId: string): Promise<FinancingDto> {
    return this.create(userId, DEMO_FINANCING);
  }

  async getFinancingEntity(id: string, userId: string): Promise<Financing> {
    const financing = await this.financingRepository.findByIdForUser(id, userId);

    if (!financing) {
      throw new NotFoundException('Financing not found');
    }

    return financing;
  }

  async getScheduleDrafts(financingId: string, userId: string) {
    const installments = await this.installmentRepository.findByFinancingForUser(
      financingId,
      userId,
    );

    return mapInstallmentsToDrafts(installments);
  }
}
