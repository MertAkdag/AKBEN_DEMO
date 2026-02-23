import type { DashboardSummary } from '../entities/Dashboard';

export interface IDashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}

