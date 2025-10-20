import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Request() req) {
    return this.dashboardService.getStats(req.user.sub);
  }

  @Get('activity')
  getRecentActivity(@Request() req) {
    return this.dashboardService.getRecentActivity(req.user.sub);
  }
}
