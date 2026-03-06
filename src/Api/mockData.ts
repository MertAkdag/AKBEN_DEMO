import type { DashboardSummary } from '../domain/entities/Dashboard';
import type { Machine, MachineLog, PerformanceData } from '../Types/machine';
import type { Order, UpdateOrderPayload } from '../Types/order';
import type { Transaction } from '../Types/transaction';
import type { Cari, CariBank, CariContact, CreateCariPayload, CreateCariBankInput } from '../Types/cari';
import type { Product, Category, Variant, Brand, Unit } from '../Types/catalog';

const now = new Date().toISOString();
const date = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

/** Kuyumcu: Toplam satış/alış/kar/işçilik (gram) + haftalık veri */
export const MOCK_DASHBOARD: DashboardSummary = {
  totalSalesGram: 2847,
  totalPurchaseGram: 1920,
  totalProfitGram: 927,
  totalLaborGram: 456,
  weeklyGramData: [
    { label: 'Pzt', salesGram: 320, purchaseGram: 180, profitGram: 140 },
    { label: 'Sal', salesGram: 410, purchaseGram: 250, profitGram: 160 },
    { label: 'Çar', salesGram: 380, purchaseGram: 220, profitGram: 160 },
    { label: 'Per', salesGram: 520, purchaseGram: 310, profitGram: 210 },
    { label: 'Cum', salesGram: 480, purchaseGram: 280, profitGram: 200 },
    { label: 'Cmt', salesGram: 390, purchaseGram: 240, profitGram: 150 },
    { label: 'Paz', salesGram: 347, purchaseGram: 440, profitGram: 93 },
  ],
};

/** Kuyumcu: İşlemler (Satış / Alış / İşçilik gram) */
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'SALE', gram: 12.5, description: 'Bilezik - 14 ayar altın', customerName: 'Elif Yıldız', date: date(0), createdAt: now, updatedAt: now },
  { id: 't2', type: 'PURCHASE', gram: 25, description: 'Ham altın alımı - Külçe', date: date(0), createdAt: now, updatedAt: now },
  { id: 't3', type: 'LABOR', gram: 3.2, description: 'Yüzük işçiliği - Özel tasarım', customerName: 'Mehmet Kaya', date: date(-1), createdAt: date(-1), updatedAt: date(-1) },
  { id: 't4', type: 'SALE', gram: 8.75, description: 'Kolye ucu - 18 ayar', customerName: 'Ayşe Demir', date: date(-1), createdAt: date(-1), updatedAt: date(-1) },
  { id: 't5', type: 'PURCHASE', gram: 50, description: 'Gümüş alımı - 925 ayar', date: date(-2), createdAt: date(-2), updatedAt: date(-2) },
  { id: 't6', type: 'SALE', gram: 15, description: 'Set - Kolye + Küpe', customerName: 'Fatma Öz', date: date(-2), createdAt: date(-2), updatedAt: date(-2) },
  { id: 't7', type: 'LABOR', gram: 2.1, description: 'Tamir - Kolye klips', customerName: 'Ali Vural', date: date(-3), createdAt: date(-3), updatedAt: date(-3) },
];

const MOCK_MACHINES: Machine[] = [
  { id: 'm1', name: 'CNC Torna A-1', model: 'CNC-X200', status: 'ACTIVE', location: 'Atölye 1', runtime: 1240, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm2', name: 'Freze Makinesi B-2', model: 'FRZ-500', status: 'ACTIVE', location: 'Atölye 1', runtime: 892, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm3', name: 'Pres Makinesi C-1', model: 'PRS-300', status: 'MAINTENANCE', location: 'Atölye 2', runtime: 2100, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm4', name: 'Paketleme Hattı D-1', model: 'PKG-100', status: 'ACTIVE', location: 'Atölye 3', runtime: 560, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm5', name: 'Kalite Kontrol E-1', model: 'QC-200', status: 'OFFLINE', location: 'Atölye 2', runtime: 320, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm6', name: 'Kaynak Robotu F-1', model: 'WLD-R1', status: 'ACTIVE', location: 'Atölye 1', runtime: 780, createdAt: now, updatedAt: now, deletedAt: null },
];

export const MOCK_MACHINE_LOGS: Record<string, MachineLog[]> = {
  m1: [
    { id: 'log1', machineId: 'm1', date: date(-1), description: 'Makine başarıyla başlatıldı', createdAt: date(-1) + 'T08:00:00.000Z' },
    { id: 'log2', machineId: 'm1', date: date(-1), description: 'Rutin bakım tamamlandı', createdAt: date(-1) + 'T14:30:00.000Z' },
    { id: 'log3', machineId: 'm1', date: date(0), description: 'Üretim devam ediyor - Parti #4521', createdAt: now },
  ],
  m2: [
    { id: 'log4', machineId: 'm2', date: date(-2), description: 'Error: Sensör arızası giderildi', createdAt: date(-2) + 'T10:15:00.000Z' },
    { id: 'log5', machineId: 'm2', date: date(0), description: 'Makine çalışır durumda', createdAt: now },
  ],
  m3: [
    { id: 'log6', machineId: 'm3', date: date(0), description: 'Planlı bakım başladı', createdAt: now },
  ],
};

export const MOCK_PERFORMANCE: PerformanceData[] = [
  { id: 'p1', machineId: 'm1', timestamp: now, metricValue: 55, createdAt: now },
  { id: 'p2', machineId: 'm1', timestamp: now, metricValue: 58, createdAt: now },
  { id: 'p3', machineId: 'm1', timestamp: now, metricValue: 65, createdAt: now },
  { id: 'p4', machineId: 'm1', timestamp: now, metricValue: 50, createdAt: now },
  { id: 'p5', machineId: 'm1', timestamp: now, metricValue: 45, createdAt: now },
  { id: 'p6', machineId: 'm1', timestamp: now, metricValue: 55, createdAt: now },
  { id: 'p7', machineId: 'm1', timestamp: now, metricValue: 60, createdAt: now },
  { id: 'p8', machineId: 'm1', timestamp: now, metricValue: 75, createdAt: now },
  { id: 'p9', machineId: 'm1', timestamp: now, metricValue: 80, createdAt: now },
  { id: 'p10', machineId: 'm1', timestamp: now, metricValue: 65, createdAt: now },
  { id: 'p11', machineId: 'm1', timestamp: now, metricValue: 70, createdAt: now },
  { id: 'p12', machineId: 'm1', timestamp: now, metricValue: 75, createdAt: now },
  { id: 'p13', machineId: 'm1', timestamp: now, metricValue: 65, createdAt: now },
  { id: 'p14', machineId: 'm1', timestamp: now, metricValue: 60, createdAt: now },
  { id: 'p15', machineId: 'm1', timestamp: now, metricValue: 55, createdAt: now },
];

const pagination = (total: number, page: number, limit: number) => ({
  total,
  limit,
  currentPage: page,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
  nextPage: page * limit < total ? page + 1 : null,
  previousPage: page > 1 ? page - 1 : null,
});

export function getMockTransactions(page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  const data = MOCK_TRANSACTIONS.slice(start, start + pageSize);
  return {
    success: true,
    data,
    meta: { pagination: pagination(MOCK_TRANSACTIONS.length, page, pageSize) },
  };
}

export function getMockTransactionById(id: string) {
  const transaction = MOCK_TRANSACTIONS.find((t) => t.id === id);
  return transaction ? { success: true, data: transaction } : null;
}

/** CRM: Cari banka hesapları (CUSTOMER BANKS) */
const MOCK_CARI_BANKS_INITIAL: CariBank[] = [
  { id: 'cb1', cariId: 'c1', bankName: 'Ziraat Bankası', iban: 'TR33 0006 1005 1978 6457 8410 01', accountName: 'Elif Yıldız', branch: 'Kadıköy Şube' },
  { id: 'cb2', cariId: 'c1', bankName: 'İş Bankası', iban: 'TR64 0006 4000 0011 2340 0000 12', accountName: 'E. Yıldız', branch: 'Caferağa' },
  { id: 'cb3', cariId: 'c2', bankName: 'Garanti BBVA', iban: 'TR12 0006 2000 1230 0006 2900 23', accountName: 'Mehmet Kaya', branch: 'Beşiktaş' },
  { id: 'cb4', cariId: 'c4', bankName: 'Yapı Kredi', iban: 'TR89 0006 7010 0000 0056 7812 34', accountName: 'Fatma Öz - Şirket', branch: 'Levent' },
  { id: 'cb5', cariId: 'c4', bankName: 'Akbank', iban: 'TR45 0004 6001 2345 6789 0123 45', accountName: 'Fatma Öz', branch: 'Maslak' },
];
let cariBanksStore = [...MOCK_CARI_BANKS_INITIAL];

/** CRM: Cari iletişim kişileri (CUSTOMER CONTACTS) */
const MOCK_CARI_CONTACTS: CariContact[] = [
  { id: 'cc1', cariId: 'c1', name: 'Elif Yıldız', phone: '0532 111 22 33', email: 'elif@email.com', title: 'Yetkili' },
  { id: 'cc2', cariId: 'c2', name: 'Mehmet Kaya', phone: '0533 444 55 66', email: 'mehmet@email.com', title: 'Sipariş' },
  { id: 'cc3', cariId: 'c2', name: 'Zeynep Kaya', phone: '0533 444 55 67', email: 'zeynep.k@email.com', title: 'Eş (teslim)' },
  { id: 'cc4', cariId: 'c3', name: 'Ayşe Demir', phone: '0534 777 88 99', title: 'Yetkili' },
  { id: 'cc5', cariId: 'c4', name: 'Fatma Öz', phone: '0535 000 11 22', email: 'fatma@email.com', title: 'Genel Müdür' },
  { id: 'cc6', cariId: 'c4', name: 'Can Öz', phone: '0535 000 11 23', email: 'can@email.com', title: 'Muhasebe' },
  { id: 'cc7', cariId: 'c5', name: 'Ali Vural', phone: '0536 333 44 55', title: 'Yetkili' },
];

/** Kuyumcu: Cariler (müşteri hesapları, bakiye) */
const MOCK_CARILER_INITIAL: Cari[] = [
  { id: 'c1', name: 'Elif Yıldız', phone: '0532 111 22 33', email: 'elif@email.com', address: 'Kadıköy, İstanbul', balance: 2450, notes: 'Düzenli müşteri. Tercih: 14 ayar.', createdAt: date(-60), updatedAt: now },
  { id: 'c2', name: 'Mehmet Kaya', phone: '0533 444 55 66', email: 'mehmet@email.com', address: 'Beşiktaş, İstanbul', balance: -1200, notes: 'Nişan yüzüğü siparişi bekliyor.', createdAt: date(-45), updatedAt: now },
  { id: 'c3', name: 'Ayşe Demir', phone: '0534 777 88 99', address: 'Üsküdar, İstanbul', balance: 0, notes: '', createdAt: date(-30), updatedAt: now },
  { id: 'c4', name: 'Fatma Öz', phone: '0535 000 11 22', email: 'fatma@email.com', balance: 5800, notes: 'Kurumsal alımlar. Vadeli ödeme.', createdAt: date(-20), updatedAt: now },
  { id: 'c5', name: 'Ali Vural', phone: '0536 333 44 55', address: 'Şişli, İstanbul', balance: -450, notes: 'Tamir işleri.', createdAt: date(-10), updatedAt: now },
  { id: 'c6', name: 'Zeynep Ak', phone: '0537 666 77 88', email: 'zeynep@email.com', balance: 1200, notes: '', createdAt: date(-5), updatedAt: now },
];

let carilerStore = [...MOCK_CARILER_INITIAL];

export function getMockCariler(page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  const data = carilerStore.slice(start, start + pageSize);
  return {
    success: true,
    data,
    meta: { pagination: pagination(carilerStore.length, page, pageSize) },
  };
}

export function getMockCariById(id: string) {
  const cari = carilerStore.find((c) => c.id === id);
  if (!cari) return null;
  const banks = cariBanksStore.filter((b) => b.cariId === id);
  const contacts = MOCK_CARI_CONTACTS.filter((c) => c.cariId === id);
  return { success: true, data: { ...cari, banks, contacts } };
}

function addMockCariBank(cariId: string, input: CreateCariBankInput): void {
  const id = 'cb' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  cariBanksStore.push({
    id,
    cariId,
    bankName: input.bankName.trim(),
    iban: input.iban.trim().replace(/\s/g, ''),
    accountName: input.accountName?.trim(),
    branch: input.branch?.trim(),
  });
}

export function createMockCari(payload: CreateCariPayload): Cari {
  const id = 'c' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  const ts = new Date().toISOString();
  const newCari: Cari = {
    id,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || undefined,
    address: payload.address?.trim() || undefined,
    notes: payload.notes?.trim() || undefined,
    balance: 0,
    createdAt: ts,
    updatedAt: ts,
  };
  carilerStore.unshift(newCari);
  if (payload.bank && (payload.bank.bankName.trim() || payload.bank.iban.trim())) {
    addMockCariBank(id, payload.bank);
  }
  return newCari;
}

/** CATALOG: Kategoriler – AKBEN yapısına uygun (Bileklik, Kelepçe, Yüzük, Küpe)
 * NOT: Bu mock veriler artık sadece gerçek API'ye henüz bağlanmamış servisler tarafından kullanılıyor.
 * catalogService gerçek API'den veri çekiyor.
 */
const MOCK_CATEGORIES: any[] = [
  { id: 'cat1', name: 'Bileklik', slug: 'bileklik', productCount: 4 },
  { id: 'cat2', name: 'Yüzük', slug: 'yuzuk', productCount: 3 },
  { id: 'cat3', name: 'Kolye', slug: 'kolye', productCount: 0 },
  { id: 'cat4', name: 'Küpe', slug: 'kupe', productCount: 2 },
  { id: 'cat5', name: 'Kolye Ucu', slug: 'kolye-ucu', productCount: 0 },
  { id: 'cat6', name: 'Set', slug: 'set', productCount: 1 },
  { id: 'cat7', name: 'Kelepçe', slug: 'klepce', productCount: 3 },
];

const MOCK_VARIANTS: any[] = [
  { id: 'v1', name: '14 Ayar', slug: '14k' },
  { id: 'v2', name: '18 Ayar', slug: '18k' },
  { id: 'v3', name: '22 Ayar', slug: '22k' },
  { id: 'v4', name: '925 Gümüş', slug: '925' },
];

const MOCK_BRANDS: any[] = [
  { id: 'b1', name: 'Atölye' },
  { id: 'b2', name: 'Klasik' },
  { id: 'b3', name: 'Modern' },
];

const MOCK_UNITS: any[] = [
  { id: 'u1', name: 'Adet', symbol: 'ad' },
  { id: 'u2', name: 'Gram', symbol: 'gr' },
];

/** AKBEN Kuyumculuk ürün görselleri (https://akbenkuyumculuk.com/urunlerimiz/) */
const AKBEN_IMG = 'https://akbenkuyumculuk.com/wp-content/uploads/2023/10';

/** Ürün isimleri ve kategorileri AKBEN fotoğraflarına göre (bileklik, kelepce, yuzuk, kupe) */
const MOCK_PRODUCTS: any[] = [
  { id: 'p1', name: 'Bileklik', description: 'El işi has örgü, 22 ayar sarı altın.', categoryId: 'cat1', variantId: 'v3', brandId: 'b1', unitId: 'u2', pricePerUnit: 2850, featured: true, imageUrl: `${AKBEN_IMG}/akben_bileklik_1.png`, createdAt: now, updatedAt: now },
  { id: 'p2', name: 'Bileklik', description: 'Minimal çift bileklik seti, 22 ayar altın.', categoryId: 'cat1', variantId: 'v3', brandId: 'b2', unitId: 'u1', pricePerUnit: 4200, featured: true, imageUrl: `${AKBEN_IMG}/akben_bileklik_2.png`, createdAt: now, updatedAt: now },
  { id: 'p3', name: 'Kelepçe', description: 'Pırlanta taşlı kelepçe, 22 ayar.', categoryId: 'cat7', variantId: 'v3', brandId: 'b3', unitId: 'u1', pricePerUnit: 12500, featured: false, imageUrl: `${AKBEN_IMG}/akben_kelepce_4.png`, createdAt: now, updatedAt: now },
  { id: 'p4', name: 'Bileklik', description: '22 ayar altın, ince işçilik.', categoryId: 'cat1', variantId: 'v3', brandId: 'b2', unitId: 'u1', pricePerUnit: 3600, featured: false, imageUrl: `${AKBEN_IMG}/akben_bileklik_3.png`, createdAt: now, updatedAt: now },
  { id: 'p5', name: 'Yüzük', description: 'Pırlanta taşlı, 22 ayar altın.', categoryId: 'cat2', variantId: 'v3', brandId: 'b3', unitId: 'u1', pricePerUnit: 18500, featured: true, imageUrl: `${AKBEN_IMG}/akben_yuzuk_1.png`, createdAt: now, updatedAt: now },
  { id: 'p6', name: 'Yüzük', description: '22 ayar sarı altın, sade alyans.', categoryId: 'cat2', variantId: 'v3', brandId: 'b2', unitId: 'u1', pricePerUnit: 3200, featured: false, imageUrl: `${AKBEN_IMG}/akben_yuzuk_2.png`, createdAt: now, updatedAt: now },
  { id: 'p7', name: 'Yüzük', description: 'İnce taşlı yüzük, 22 ayar.', categoryId: 'cat2', variantId: 'v3', brandId: 'b1', unitId: 'u1', pricePerUnit: 4500, featured: false, imageUrl: `${AKBEN_IMG}/akben_yuzuk_3.png`, createdAt: now, updatedAt: now },
  { id: 'p8', name: 'Kelepçe', description: 'Tek taş pırlanta kelepçe, 22 ayar.', categoryId: 'cat7', variantId: 'v3', brandId: 'b3', unitId: 'u1', pricePerUnit: 9200, featured: true, imageUrl: `${AKBEN_IMG}/akben_kelepce_3.png`, createdAt: now, updatedAt: now },
  { id: 'p9', name: 'Kelepçe', description: 'Şık kelepçe, 22 ayar altın.', categoryId: 'cat7', variantId: 'v3', brandId: 'b2', unitId: 'u1', pricePerUnit: 5200, featured: false, imageUrl: `${AKBEN_IMG}/akben_kelepce_6.png`, createdAt: now, updatedAt: now },
  { id: 'p10', name: 'Bileklik', description: 'İnce zincir bileklik, 22 ayar.', categoryId: 'cat1', variantId: 'v3', brandId: 'b1', unitId: 'u2', pricePerUnit: 2100, featured: false, imageUrl: `${AKBEN_IMG}/akben_bileklik_4.png`, createdAt: now, updatedAt: now },
  { id: 'p11', name: 'Küpe', description: 'Pırlanta taşlı küpe, 22 ayar.', categoryId: 'cat4', variantId: 'v3', brandId: 'b3', unitId: 'u1', pricePerUnit: 3800, featured: false, imageUrl: `${AKBEN_IMG}/akben_kupe_1.png`, createdAt: now, updatedAt: now },
  { id: 'p12', name: 'Küpe', description: 'Çift küpe, 22 ayar.', categoryId: 'cat4', variantId: 'v3', brandId: 'b2', unitId: 'u1', pricePerUnit: 2100, featured: false, imageUrl: `${AKBEN_IMG}/akben_kupe_2.png`, createdAt: now, updatedAt: now },
  { id: 'p13', name: 'Set', description: 'Düğün seti küpe, 22 ayar.', categoryId: 'cat6', variantId: 'v3', brandId: 'b3', unitId: 'u1', pricePerUnit: 15800, featured: true, imageUrl: `${AKBEN_IMG}/akben_kupe_3.png`, createdAt: now, updatedAt: now },
];

function attachCatalogRelations(products: any[]): any[] {
  return products.map((p) => ({
    ...p,
    category: MOCK_CATEGORIES.find((c) => c.id === p.categoryId),
    variant: MOCK_VARIANTS.find((v) => v.id === p.variantId),
    brand: p.brandId ? MOCK_BRANDS.find((b) => b.id === p.brandId) : undefined,
    unit: MOCK_UNITS.find((u) => u.id === p.unitId),
  }));
}

export function getMockCategories(): any[] {
  return MOCK_CATEGORIES;
}

export function getMockProducts(page = 1, pageSize = 20, categoryId?: string, search?: string): { success: boolean; data: any[]; meta: { pagination: ReturnType<typeof pagination> } } {
  let list = [...MOCK_PRODUCTS];
  if (categoryId) list = list.filter((p) => p.categoryId === categoryId);
  if (search?.trim()) {
    const q = search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const data = attachCatalogRelations(list.slice(start, start + pageSize));
  return {
    success: true,
    data,
    meta: { pagination: pagination(total, page, pageSize) },
  };
}

export function getMockProductById(id: string): { success: boolean; data: any } | null {
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) return null;
  const [withRelations] = attachCatalogRelations([product]);
  return { success: true, data: withRelations };
}

export function getMockFeaturedProducts(): any[] {
  return attachCatalogRelations(MOCK_PRODUCTS.filter((p) => p.featured));
}

export function getMockMachines(page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const data = MOCK_MACHINES.slice(start, start + pageSize);
  return {
    success: true,
    data,
    meta: { pagination: pagination(MOCK_MACHINES.length, page, pageSize) },
  };
}

export function getMockMachineById(id: string) {
  const machine = MOCK_MACHINES.find((m) => m.id === id);
  return machine ? { success: true, data: machine } : null;
}

export function getMockMachineLogs(id: string) {
  const logs = MOCK_MACHINE_LOGS[id] || [];
  return { success: true, data: logs };
}

export function getMockPerformance(id: string) {
  return { success: true, data: MOCK_PERFORMANCE.map((p) => ({ ...p, machineId: id })) };
}

/** Kuyumcu: Cariler (müşteri, ürün, teslim tarihi) - Order tipi machine=ürün, assignedUser=müşteri */
const JEWELRY_PRODUCTS = [
  { id: 'm1', name: 'Bilezik - 14 ayar', model: '14K', status: 'active', location: 'Stok', runtime: 0, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm2', name: 'Yüzük - Özel tasarım', model: '18K', status: 'active', location: 'Atölye', runtime: 0, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm3', name: 'Kolye ucu', model: '925 gümüş', status: 'active', location: 'Stok', runtime: 0, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm4', name: 'Küpe seti', model: '14K', status: 'active', location: 'Vitrin', runtime: 0, createdAt: now, updatedAt: now, deletedAt: null },
  { id: 'm5', name: 'Kolye + Küpe set', model: '18K', status: 'active', location: 'Atölye', runtime: 0, createdAt: now, updatedAt: now, deletedAt: null },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    title: 'Bilezik - 14 ayar altın',
    description: 'Bayandan bilezik siparişi. 12 gr civarı. Kaynaklı kapama.',
    status: 'IN_PROGRESS',
    assignedTo: 'u1',
    deadline: date(3),
    machineId: 'm1',
    createdAt: date(-2),
    updatedAt: now,
    deletedAt: null,
    machine: JEWELRY_PRODUCTS[0],
    assignedUser: { id: 'u1', email: 'elif@email.com', name: 'Elif Yıldız', role: 'USER' },
  },
  {
    id: 'o2',
    title: 'Yüzük - Nişan yüzüğü',
    description: 'Özel tasarım nişan yüzüğü. 3 taş, 18 ayar beyaz altın.',
    status: 'PENDING',
    assignedTo: 'u2',
    deadline: date(7),
    machineId: 'm2',
    createdAt: date(-1),
    updatedAt: now,
    deletedAt: null,
    machine: JEWELRY_PRODUCTS[1],
    assignedUser: { id: 'u2', email: 'mehmet@email.com', name: 'Mehmet Kaya', role: 'USER' },
  },
  {
    id: 'o3',
    title: 'Kolye tamiri',
    description: 'Kolye klips tamiri. Müşteri getirdi.',
    status: 'COMPLETED',
    assignedTo: 'u1',
    deadline: date(-2),
    machineId: 'm3',
    createdAt: date(-5),
    updatedAt: date(-2),
    deletedAt: null,
    machine: JEWELRY_PRODUCTS[2],
    assignedUser: { id: 'u1', email: 'elif@email.com', name: 'Elif Yıldız', role: 'USER' },
  },
  {
    id: 'o4',
    title: 'Küpe seti - Gümüş',
    description: '925 ayar gümüş küpe. 2 çift, farklı modeller.',
    status: 'PENDING',
    assignedTo: 'u3',
    deadline: date(5),
    machineId: 'm4',
    createdAt: date(0),
    updatedAt: now,
    deletedAt: null,
    machine: JEWELRY_PRODUCTS[3],
    assignedUser: { id: 'u3', email: 'ayse@email.com', name: 'Ayşe Demir', role: 'USER' },
  },
  {
    id: 'o5',
    title: 'Düğün seti - Kolye + Küpe',
    description: '18 ayar altın düğün seti. Taşlı, özel kutu.',
    status: 'IN_PROGRESS',
    assignedTo: 'u2',
    deadline: date(4),
    machineId: 'm5',
    createdAt: date(-1),
    updatedAt: now,
    deletedAt: null,
    machine: JEWELRY_PRODUCTS[4],
    assignedUser: { id: 'u2', email: 'mehmet@email.com', name: 'Mehmet Kaya', role: 'USER' },
  },
];

let ordersStore = [...MOCK_ORDERS];

export function getMockOrders(page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  const data = ordersStore.slice(start, start + pageSize);
  return {
    success: true,
    data,
    meta: { pagination: pagination(ordersStore.length, page, pageSize) },
  };
}

export function getMockOrderById(id: string) {
  const order = ordersStore.find((o) => o.id === id);
  return order ? { success: true, data: order } : null;
}

export function updateMockOrder(id: string, payload: UpdateOrderPayload) {
  const index = ordersStore.findIndex((o) => o.id === id);
  if (index === -1) return null;
  ordersStore[index] = { ...ordersStore[index], ...payload, updatedAt: new Date().toISOString() };
  return { success: true, data: ordersStore[index] };
}
