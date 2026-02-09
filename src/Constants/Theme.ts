/** Tema renk tipleri – tüm uygulama genelinde kullanılır */
export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  card: string;
  input: string;

  primary: string;
  secondary: string;
  success: string;

  text: string;
  subtext: string;

  warning: string;
  error: string;
  info: string;

  border: string;

  catalogGold: string;
  catalogGoldLight: string;
  catalogGoldDark: string;

  /* Yardımcı – border, divider, overlay */
  cardBorder: string;
  divider: string;
  skeleton: string;
  /** Tab bar glass overlay */
  glassOverlay: string;
  /** iOS status bar stili */
  statusBar: 'light' | 'dark';
}

/* ─── Altın tonları ─── */
const GOLD = '#C9A227';
const GOLD_LIGHT = '#E8D48B';
const GOLD_DARK = '#8B6914';

/* ═══════════════════════════════════════════
   KOYU TEMA (mevcut tasarım)
   ═══════════════════════════════════════════ */
export const DarkTheme: ThemeColors = {
  background: '#111111',
  card: '#1E1E1E',
  input: '#323232',

  primary: GOLD,
  secondary: GOLD_DARK,
  success: '#22C55E',

  text: '#ECECEC',
  subtext: '#A9A9A9',

  warning: '#EAB308',
  error: '#EF4444',
  info: GOLD,

  border: '#2A2A2A',

  catalogGold: GOLD,
  catalogGoldLight: GOLD_LIGHT,
  catalogGoldDark: GOLD_DARK,

  cardBorder: '#ffffff08',
  divider: '#ffffff06',
  skeleton: '#2A2A2A',
  glassOverlay: '#1E1E1ED8',
  statusBar: 'light',
};

/* ═══════════════════════════════════════════
   BEYAZ TEMA
   ═══════════════════════════════════════════ */
const GOLD_ON_LIGHT = '#9A7B16'; // Beyaz üzerinde kontrastı yüksek altın

export const LightTheme: ThemeColors = {
  background: '#F5F5F7',
  card: '#FFFFFF',
  input: '#EFEFF1',

  primary: GOLD_ON_LIGHT,
  secondary: GOLD_DARK,
  success: '#16A34A',

  text: '#1A1A1A',
  subtext: '#6B7280',

  warning: '#D97706',
  error: '#DC2626',
  info: GOLD_ON_LIGHT,

  border: '#E5E5EA',

  catalogGold: GOLD_ON_LIGHT,
  catalogGoldLight: GOLD_LIGHT,
  catalogGoldDark: GOLD_DARK,

  cardBorder: '#00000008',
  divider: '#00000006',
  skeleton: '#E5E5EA',
  glassOverlay: '#FFFFFFD8',
  statusBar: 'dark',
};
