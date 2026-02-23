import type { DashboardSummary } from '../../../domain/entities/Dashboard';
import type { IDashboardRepository } from '../../../domain/repositories/IDashboardRepository';

export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<DashboardSummary> {
    return this.dashboardRepository.getSummary();
  }
}

