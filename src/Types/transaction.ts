/** Kuyumcu: Satış / Alış / İşçilik hareketi (gram) */
export type TransactionType = 'SALE' | 'PURCHASE' | 'LABOR';

export interface Transaction {
  id: string;
  type: TransactionType;
  gram: number;
  description: string;
  customerName?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  meta?: {
    pagination: {
      total: number;
      limit: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

export interface TransactionDetailResponse {
  success: boolean;
  data: Transaction;
}

export const transactionTypeLabel: Record<TransactionType, string> = {
  SALE: 'Satış',
  PURCHASE: 'Alış',
  LABOR: 'İşçilik',
};
