/** CRM: Cariye ait banka hesabı (CUSTOMER BANKS) */
export interface CariBank {
  id: string;
  cariId: string;
  bankName: string;
  iban: string;
  accountName?: string;
  branch?: string;
}

/** CRM: Cariye ait iletişim kişisi (CUSTOMER CONTACTS) */
export interface CariContact {
  id: string;
  cariId: string;
  name: string;
  phone: string;
  email?: string;
  title?: string;
}

/** Kuyumcu: Cari (müşteri hesabı) */
export interface Cari {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  /** Bakiye: pozitif = bize borçlu (alacak), negatif = biz borçluyuz */
  balance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  /** Detayda doldurulur (CRM) */
  banks?: CariBank[];
  contacts?: CariContact[];
}

export interface CarilerResponse {
  success: boolean;
  data: Cari[];
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

export interface CariDetailResponse {
  success: boolean;
  data: Cari;
}

export type CariFilterOption = 'All' | 'Alacakli' | 'Borclu';

export const cariFilterLabel: Record<CariFilterOption, string> = {
  All: 'Tümü',
  Alacakli: 'Alacaklı',
  Borclu: 'Borçlu',
};

/** Yeni cari eklerken opsiyonel ilk banka hesabı */
export interface CreateCariBankInput {
  bankName: string;
  iban: string;
  accountName?: string;
  branch?: string;
}

/** Yeni cari eklerken gönderilecek alanlar */
export interface CreateCariPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  /** İlk banka hesabı (vadeli ödeme vb. için) */
  bank?: CreateCariBankInput;
  notes?: string;
}
