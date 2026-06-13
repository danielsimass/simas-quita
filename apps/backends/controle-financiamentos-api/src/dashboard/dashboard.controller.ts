import { Controller, Get, Param, Req } from '@nestjs/common';
import { DashboardDto } from '@simas-quita/shared-financing-types';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { DashboardService } from './dashboard.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('financings')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':id/dashboard')
  getDashboard(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<DashboardDto> {
    return this.dashboardService.getDashboard(id, request.user.userId);
  }
}
