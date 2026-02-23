import type { Product } from '../../Types/catalog';

export class CartItem {
  constructor(
    public readonly product: Product,
    public readonly quantity: number,
    public readonly capturedPricePerUnit: number,
    public readonly capturedAt: Date,
  ) {
    if (quantity <= 0) {
      throw new Error('Sepet adedi 0 veya negatif olamaz.');
    }
    if (capturedPricePerUnit < 0) {
      throw new Error('Fiyat negatif olamaz.');
    }
  }

  get totalPrice(): number {
    return this.quantity * this.capturedPricePerUnit;
  }

  hasPriceChanged(currentPricePerUnit: number): boolean {
    if (this.capturedPricePerUnit === 0) return false;
    const changePercent =
      (Math.abs(currentPricePerUnit - this.capturedPricePerUnit) / this.capturedPricePerUnit) * 100;
    return changePercent > 5; // %5 eşik
  }

  getPriceChangeInfo(currentPricePerUnit: number) {
    const oldTotal = this.totalPrice;
    const newTotal = this.quantity * currentPricePerUnit;
    const difference = newTotal - oldTotal;
    const percentChange = oldTotal === 0 ? 0 : (difference / oldTotal) * 100;

    return {
      oldTotal,
      newTotal,
      difference,
      percentChange,
      direction: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'same' as const,
    };
  }
}

