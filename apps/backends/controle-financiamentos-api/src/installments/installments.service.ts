import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InstallmentStatus as PrismaInstallmentStatus } from '../prisma/client';
import {
  InstallmentDto,
  InstallmentStatus,
  UpdateInstallmentInput,
} from '@simas-quita/shared-financing-types';
import { FinancingsService } from '../financings/financings.service';
import { mapInstallmentToDto, toPrismaDate } from '../mappers/financing.mapper';
import { InstallmentRepository } from '../repositories/installment.repository';

@Injectable()
export class InstallmentsService {
  constructor(
    private readonly installmentRepository: InstallmentRepository,
    private readonly financingsService: FinancingsService,
  ) {}

  async findByFinancing(
    financingId: string,
    userId: string,
    status?: InstallmentStatus,
  ): Promise<InstallmentDto[]> {
    await this.financingsService.getFinancingEntity(financingId, userId);

    const installments = await this.installmentRepository.findByFinancingForUser(
      financingId,
      userId,
      status as PrismaInstallmentStatus | undefined,
    );

    return installments.map(mapInstallmentToDto);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateInstallmentInput,
  ): Promise<InstallmentDto> {
    const installment = await this.installmentRepository.findByIdForUser(id, userId);

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    await this.financingsService.getFinancingEntity(
      installment.financingId,
      userId,
    );

    const updatedInstallment = await this.installmentRepository.update(id, userId, {
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.dueDate !== undefined ? { dueDate: toPrismaDate(input.dueDate) } : {}),
      ...(input.paidAt !== undefined
        ? {
            paidAt: input.paidAt ? new Date(input.paidAt) : null,
            status: input.paidAt
              ? PrismaInstallmentStatus.PAID
              : PrismaInstallmentStatus.PENDING,
          }
        : {}),
    });

    if (!updatedInstallment) {
      throw new NotFoundException('Installment not found');
    }

    return mapInstallmentToDto(updatedInstallment);
  }

  async delete(id: string, userId: string): Promise<void> {
    const installment = await this.installmentRepository.findByIdForUser(id, userId);

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    await this.financingsService.getFinancingEntity(
      installment.financingId,
      userId,
    );

    const deleted = await this.installmentRepository.delete(id, userId);

    if (!deleted) {
      throw new NotFoundException('Installment not found');
    }
  }
}
