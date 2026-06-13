import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { FinancingDto } from '@simas-quita/shared-financing-types';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateFinancingDto, UpdateFinancingDto } from './financings.dto';
import { FinancingsService } from './financings.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('financings')
export class FinancingsController {
  constructor(private readonly financingsService: FinancingsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest): Promise<FinancingDto[]> {
    return this.financingsService.findByUser(request.user.userId);
  }

  @Post('seed-demo')
  seedDemo(@Req() request: AuthenticatedRequest): Promise<FinancingDto> {
    return this.financingsService.seedDemo(request.user.userId);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateFinancingDto,
  ): Promise<FinancingDto> {
    return this.financingsService.create(request.user.userId, body);
  }

  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<FinancingDto> {
    return this.financingsService.findByIdForUser(id, request.user.userId);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateFinancingDto,
  ): Promise<FinancingDto> {
    return this.financingsService.update(id, request.user.userId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.financingsService.delete(id, request.user.userId);
  }
}
