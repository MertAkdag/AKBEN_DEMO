import type { Category } from '../Types/catalog';

/** Listede en az bir kayıtta üst kategori bağlantısı var mı (ağaç kurulabilir mi)? */
export function categoriesHaveParentLinks(categories: Category[]): boolean {
  return categories.some((c) => {
    const p = c.ustKategoriId;
    return p != null && p !== undefined && Number(p) !== 0;
  });
}

/**
 * Ana kategori id’si + API listesinde görünen tüm alt kategori id’leri (DFS).
 * Ürünler genelde yaprak kategori id’siyle kayıtlıdır; filtre için hepsi birlikte kullanılır.
 */
export function getDescendantCategoryIds(rootId: number, categories: Category[]): number[] {
  const byParent = new Map<number, Category[]>();
  for (const c of categories) {
    const p = c.ustKategoriId;
    if (p == null || p === undefined || Number(p) === 0) continue;
    const pid = Number(p);
    const list = byParent.get(pid) ?? [];
    list.push(c);
    byParent.set(pid, list);
  }

  const seen = new Set<number>([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    const children = byParent.get(id);
    if (!children?.length) continue;
    for (const ch of children) {
      if (!seen.has(ch.id)) {
        seen.add(ch.id);
        stack.push(ch.id);
      }
    }
  }
  return [...seen];
}

/** Sadece bir seviye alt kategoriler (alt menü / debug) */
export function getDirectChildCategories(parentId: number, categories: Category[]): Category[] {
  return categories.filter(
    (c) => c.ustKategoriId != null && Number(c.ustKategoriId) === parentId,
  );
}
