import { catalogService } from '../../Api/catalogService';
import type { PriceService } from '../../domain/use-cases/cart/CheckoutUseCase';

export class CatalogPriceService implements PriceService {
  async getCurrentPrice(productId: string): Promise<number> {
    const response = await catalogService.getProductById(productId);
    return response.data.pricePerUnit;
  }
}

