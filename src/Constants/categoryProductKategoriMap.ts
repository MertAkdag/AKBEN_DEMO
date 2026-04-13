import type { Category } from '../Types/catalog';
import {
  categoriesHaveParentLinks,
  getDescendantCategoryIds,
} from '../Utils/categoryHierarchy';

/**
 * Kategori chip id (GET /catalog/categories → id) → ürün satırındaki kategoriId (GET /catalog/products).
 * Önce API’deki ustKategoriId ağacı kullanılır; yoksa bu elle tablo.
 * Kalıcı çözüm: backend’de tutarlı hiyerarşi + üst kategori filtresi.
 */
export const CATEGORY_CHIP_TO_PRODUCT_KATEGORI_IDS: Record<number, readonly number[]> = {
  36: [37, 38, 39, 40],

};

function categoryTreeSignature(categories?: Category[]): string {
  if (!categories?.length) return '';
  return categories
    .map((c) => `${c.id}:${c.ustKategoriId ?? ''}`)
    .sort()
    .join('|');
}

export { categoryTreeSignature };

/** Chip seçimine göre ürün listesinde filtrelenecek kategoriId’ler. `categories` varsa ustKategoriId ağacından torunlar eklenir. */
export function getProductKategoriIdsForChip(
  chipCategoryId: number | undefined,
  categories?: Category[],
): number[] | null {
  if (chipCategoryId == null) return null;

  if (categories != null && categories.length > 0 && categoriesHaveParentLinks(categories)) {
    const fromTree = getDescendantCategoryIds(chipCategoryId, categories);
    const hasDescendants = fromTree.some((id) => id !== chipCategoryId);
    if (hasDescendants) {
      return fromTree;
    }
  }

  const mapped = CATEGORY_CHIP_TO_PRODUCT_KATEGORI_IDS[chipCategoryId];
  if (mapped != null && mapped.length > 0) return [...mapped];
  return [chipCategoryId];
}

/** Çoklu kategoriId ile istemci tarafı filtre gerekli mi (API tek kategoriId kabul ediyor). */
export function chipUsesClientSideCategoryFilter(
  chipCategoryId: number | undefined,
  categories?: Category[],
): boolean {
  const ids = getProductKategoriIdsForChip(chipCategoryId, categories);
  return ids != null && ids.length > 1;
}

/** Özet histogram’da bu chip için ürün var mı? */
export function chipHasProductsInPresence(
  chipCategoryId: number,
  presenceProductKategoriIds: readonly number[],
  categories?: Category[],
): boolean {
  const targets = getProductKategoriIdsForChip(chipCategoryId, categories);
  if (targets == null) return false;
  return targets.some((kid) => presenceProductKategoriIds.includes(kid));
}
