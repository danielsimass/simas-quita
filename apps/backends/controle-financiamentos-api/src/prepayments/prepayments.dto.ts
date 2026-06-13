import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePrepaymentDto {
  @IsString()
  date!: string;

  @IsString()
  amount!: string;

  @IsInt()
  @Min(1)
  installmentCount!: number;
}

export class UpdatePrepaymentDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  installmentCount?: number;
}
