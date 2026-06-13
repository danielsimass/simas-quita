import { InstallmentStatus } from '@simas-quita/shared-financing-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateInstallmentDto {
  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  paidAt?: string | null;
}

export class InstallmentStatusQueryDto {
  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus;
}
