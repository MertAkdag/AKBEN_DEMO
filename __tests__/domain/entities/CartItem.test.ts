import { CartItem } from '../../../src/domain/entities/CartItem';
import type { Product } from '../../../src/Types/catalog';

const baseProduct = {
  id: 'p1',
  name: 'Altın Bilezik',
  urunAdi: 'Altın Bilezik',
  urunKodu: 'TST-001',
  description: 'Test ürün',
  categoryId: '1',
  kategoriId: 1,
  markaId: 1,
  birimId: 1,
  variantId: '',
  unitId: '1',
  pricePerUnit: 100,
  satisFiyati: 100,
  alisFiyati: 80,
  agirlikGr: 10,
  kdvOrani: 0,
  iscilikMilyem: 0,
  iscilikAdet: 0,
  iscilikTipi: 'MILYEM',
  milyemKatsayisi: 0,
  karMarjOrani: 0,
  karMilyem: 0,
  tasAgirlikGr: 0,
  minStokSeviyesi: 0,
  maxStokSeviyesi: 0,
  kritikStokSeviyesi: 0,
  aktifMi: true,
  katalogdaGoster: false,
  yeni: false,
  indirimli: false,
  images: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as Product;

describe('CartItem', () => {
  it('toplam fiyatı doğru hesaplamalı', () => {
    const item = new CartItem(baseProduct, 3, 120, new Date());
    expect(item.totalPrice).toBe(360);
  });

  it('fiyat değişimi %5 eşiğini geçtiğinde değişmiş sayılmalı', () => {
    const item = new CartItem(baseProduct, 1, 100, new Date());
    expect(item.hasPriceChanged(104)).toBe(false);
    expect(item.hasPriceChanged(106)).toBe(true);
  });

  it('fiyat değişim bilgisini doğru döndürmeli', () => {
    const item = new CartItem(baseProduct, 2, 100, new Date());
    const info = item.getPriceChangeInfo(120);
    expect(info.oldTotal).toBe(200);
    expect(info.newTotal).toBe(240);
    expect(info.difference).toBe(40);
    expect(info.direction).toBe('increase');
    expect(info.percentChange).toBeCloseTo(20);
  });
});

