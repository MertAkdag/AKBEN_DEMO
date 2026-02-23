import { dashboardService } from '../../../Api/dashboardService';
import type { IDashboardRepository } from '../../../domain/repositories/IDashboardRepository';
import type { DashboardSummary } from '../../../domain/entities/Dashboard';

export class DashboardRepository implements IDashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    return dashboardService.getSummary();
  }
}

