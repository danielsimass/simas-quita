import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateFinancingDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  institution!: string;

  @IsString()
  financedAmount!: string;

  @IsInt()
  @Min(1)
  installmentCount!: number;

  @IsString()
  installmentAmount!: string;

  @IsString()
  firstDueDate!: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class UpdateFinancingDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  institution?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
