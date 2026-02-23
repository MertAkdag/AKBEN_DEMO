import type { DashboardSummary } from '../domain/entities/Dashboard';
import { z } from 'zod';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const weeklyGramPointSchema = z.object({
  label: z.string(),
  salesGram: z.number(),
  purchaseGram: z.number(),
  profitGram: z.number(),
});

const dashboardSummarySchema: z.ZodType<DashboardSummary> = z.object({
  totalSalesGram: z.number(),
  totalPurchaseGram: z.number(),
  totalProfitGram: z.number(),
  totalLaborGram: z.number(),
  weeklyGramData: z.array(weeklyGramPointSchema),
});

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { MOCK_DASHBOARD } = await import('./mockData');
    await delay(400);
    return dashboardSummarySchema.parse(MOCK_DASHBOARD);
  },
};
