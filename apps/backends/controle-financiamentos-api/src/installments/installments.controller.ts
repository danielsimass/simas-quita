import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { InstallmentDto } from '@simas-quita/shared-financing-types';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { InstallmentStatusQueryDto, UpdateInstallmentDto } from './installments.dto';
import { InstallmentsService } from './installments.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller()
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get('financings/:financingId/installments')
  findByFinancing(
    @Req() request: AuthenticatedRequest,
    @Param('financingId') financingId: string,
    @Query() query: InstallmentStatusQueryDto,
  ): Promise<InstallmentDto[]> {
    return this.installmentsService.findByFinancing(
      financingId,
      request.user.userId,
      query.status,
    );
  }

  @Patch('installments/:id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateInstallmentDto,
  ): Promise<InstallmentDto> {
    return this.installmentsService.update(id, request.user.userId, body);
  }

  @Delete('installments/:id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    return this.installmentsService.delete(id, request.user.userId);
  }
}
