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
import { PrepaymentDto } from '@simas-quita/shared-financing-types';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreatePrepaymentDto, UpdatePrepaymentDto } from './prepayments.dto';
import { PrepaymentsService } from './prepayments.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller()
export class PrepaymentsController {
  constructor(private readonly prepaymentsService: PrepaymentsService) {}

  @Get('financings/:financingId/prepayments')
  findByFinancing(
    @Req() request: AuthenticatedRequest,
    @Param('financingId') financingId: string,
  ): Promise<PrepaymentDto[]> {
    return this.prepaymentsService.findByFinancing(
      financingId,
      request.user.userId,
    );
  }

  @Post('financings/:financingId/prepayments')
  create(
    @Req() request: AuthenticatedRequest,
    @Param('financingId') financingId: string,
    @Body() body: CreatePrepaymentDto,
  ): Promise<PrepaymentDto> {
    return this.prepaymentsService.create(
      financingId,
      request.user.userId,
      body,
    );
  }

  @Patch('prepayments/:id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdatePrepaymentDto,
  ): Promise<PrepaymentDto> {
    return this.prepaymentsService.update(id, request.user.userId, body);
  }

  @Delete('prepayments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.prepaymentsService.delete(id, request.user.userId);
  }
}
