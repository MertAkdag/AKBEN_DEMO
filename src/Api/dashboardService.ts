/** Haftalık gram verisi (grafik için) */
export interface WeeklyGramPoint {
  label: string;
  salesGram: number;
  purchaseGram: number;
  profitGram: number;
}

/** Kuyumcu özet: Toplam satış/alış/kar/işçilik (gram) */
export interface DashboardSummary {
  totalSalesGram: number;
  totalPurchaseGram: number;
  totalProfitGram: number;
  totalLaborGram: number;
  /** Haftalık satış/alış/kar (grafik) */
  weeklyGramData: WeeklyGramPoint[];
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { MOCK_DASHBOARD } = await import('./mockData');
    await delay(400);
    return MOCK_DASHBOARD;
  },
};
