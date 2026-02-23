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

