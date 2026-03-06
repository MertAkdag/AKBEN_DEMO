import { CartItem } from '../../../src/domain/entities/CartItem';
import type { Product } from '../../../src/Types/catalog';
import { CheckoutUseCase, type PriceService } from '../../../src/domain/use-cases/cart/CheckoutUseCase';

const baseProduct = {
  id: 'p1',
  name: 'Altın Yüzük',
  urunAdi: 'Altın Yüzük',
  urunKodu: 'TST-002',
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
  agirlikGr: 5,
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

class MockPriceService implements PriceService {
  constructor(private price: number) {}
  async getCurrentPrice(): Promise<number> {
    return this.price;
  }
}

describe('CheckoutUseCase', () => {
  it('fiyat değişimi yoksa boş liste döndürmeli', async () => {
    const useCase = new CheckoutUseCase(new MockPriceService(100));
    const item = new CartItem(baseProduct, 1, 100, new Date());

    const result = await useCase.execute({ items: [item] });
    expect(result.priceChanges).toHaveLength(0);
  });

  it('fiyat %5ten fazla arttığında değişiklik listesine eklemeli', async () => {
    const useCase = new CheckoutUseCase(new MockPriceService(120));
    const item = new CartItem(baseProduct, 1, 100, new Date());

    const result = await useCase.execute({ items: [item] });
    expect(result.priceChanges).toHaveLength(1);
    expect(result.priceChanges[0].productId).toBe('p1');
    expect(result.priceChanges[0].info.newTotal).toBe(120);
  });
});

