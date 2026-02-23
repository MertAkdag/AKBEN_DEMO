import { CartItem } from '../../../src/domain/entities/CartItem';
import type { Product } from '../../../src/Types/catalog';
import { CheckoutUseCase, type PriceService } from '../../../src/domain/use-cases/cart/CheckoutUseCase';

const baseProduct: Product = {
  id: 'p1',
  name: 'Altın Yüzük',
  description: 'Test ürün',
  categoryId: 'c1',
  variantId: 'v1',
  unitId: 'u1',
  pricePerUnit: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

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

