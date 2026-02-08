import type { TransactionsResponse, TransactionDetailResponse } from '../Types/transaction';
import { getMockTransactions, getMockTransactionById } from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const transactionService = {
  async getTransactions(page = 1, pageSize = 20): Promise<TransactionsResponse> {
    await delay(350);
    return getMockTransactions(page, pageSize);
  },

  async getTransactionById(id: string): Promise<TransactionDetailResponse> {
    await delay(300);
    const result = getMockTransactionById(id);
    if (!result) throw new Error('İşlem bulunamadı');
    return result;
  },
};
