import type { CartItem } from '../../../domain/entities/CartItem';

export interface PriceService {
  getCurrentPrice(productId: string): Promise<number>;
}

export interface CheckoutPriceChange {
  productId: string;
  productName: string;
  info: ReturnType<CartItem['getPriceChangeInfo']>;
}

export interface CheckoutInput {
  items: CartItem[];
}

export interface CheckoutResult {
  priceChanges: CheckoutPriceChange[];
}

export class CheckoutUseCase {
  constructor(private readonly priceService: PriceService) {}

  async execute(input: CheckoutInput): Promise<CheckoutResult> {
    const priceChanges: CheckoutPriceChange[] = [];

    for (const item of input.items) {
      const currentPrice = await this.priceService.getCurrentPrice(item.product.id);
      if (item.hasPriceChanged(currentPrice)) {
        priceChanges.push({
          productId: item.product.id,
          productName: item.product.name,
          info: item.getPriceChangeInfo(currentPrice),
        });
      }
    }

    return { priceChanges };
  }
}

