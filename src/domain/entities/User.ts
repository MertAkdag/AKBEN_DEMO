/** API'den gelen kullanıcı cari bilgisi */
export interface UserCari {
  id: string;
  cariAdi: string;
}

/** IAM: Kullanıcı — /iam/me ve /iam/login response'undaki user objesi */
export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cari?: UserCari;
  isActive: boolean;
  lastLogin?: string;
  roles: string[];

  /* ── Uyumluluk alanları (UI'da kolay kullanım) ── */
  /** firstName + lastName birleşimi */
  name: string;
  /** İlk rol */
  role: string;
}

/** API'den gelen ham user verisini normalize et */
export function normalizeUser(raw: any): User {
  return {
    id: raw.id,
    userName: raw.userName ?? '',
    firstName: raw.firstName ?? '',
    lastName: raw.lastName ?? '',
    email: raw.email ?? '',
    phone: raw.phone,
    cari: raw.cari,
    isActive: raw.isActive ?? true,
    lastLogin: raw.lastLogin,
    roles: raw.roles ?? [],
    // Uyumluluk
    name: `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() || raw.userName || 'Kullanıcı',
    role: raw.roles?.[0] ?? 'USER',
  };
}

