import type { CarilerResponse, CariDetailResponse, CreateCariPayload } from '../Types/cari';
import { getMockCariler, getMockCariById, createMockCari } from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const cariService = {
  async getCariler(page = 1, pageSize = 20): Promise<CarilerResponse> {
    await delay(350);
    return getMockCariler(page, pageSize);
  },

  async getCariById(id: string): Promise<CariDetailResponse> {
    await delay(300);
    const result = getMockCariById(id);
    if (!result) throw new Error('Cari bulunamadı');
    return result;
  },

  async createCari(payload: CreateCariPayload): Promise<CariDetailResponse> {
    await delay(400);
    const newCari = createMockCari(payload);
    const detail = getMockCariById(newCari.id);
    if (!detail) throw new Error('Cari oluşturuldu ancak detay alınamadı');
    return { success: true, data: detail.data };
  },
};
