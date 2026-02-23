import { useCallback, useEffect, useState } from 'react';
import type { DashboardSummary } from '../../domain/entities/Dashboard';
import { DashboardRepository } from '../../infrastructure/api/repositories/DashboardRepository';
import { GetDashboardSummaryUseCase } from '../../domain/use-cases/dashboard/GetDashboardSummaryUseCase';

const dashboardRepository = new DashboardRepository();
const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(dashboardRepository);

export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const summary = await getDashboardSummaryUseCase.execute();
      setData(summary);
    } catch (e: any) {
      setError(e?.message || 'Veriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
  };
}

