import { CartItem } from '../../../src/domain/entities/CartItem';
import type { Product } from '../../../src/Types/catalog';

const baseProduct: Product = {
  id: 'p1',
  name: 'Altın Bilezik',
  description: 'Test ürün',
  categoryId: 'c1',
  variantId: 'v1',
  unitId: 'u1',
  pricePerUnit: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

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

