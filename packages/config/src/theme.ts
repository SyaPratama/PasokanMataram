/**
 * @file src/config/theme.ts
 * @description Token visual resmi PasokMataram untuk integrasi konfigurasi styling.
 * Mematuhi Prinsip VIII.1 dan Prinsip IX Konstitusi PasokMataram v1.9.0.
 */

/**
 * Matriks token warna resmi PasokMataram dengan arsitektur 3 lapis (Primitive, Semantic, Component).
 */
export const themeColors = {
  primer: {
    DEFAULT: '#2E5339',
    hover: '#24422D',
    dark: '#24422D',
    light: '#EAF0EB',
    deep: '#1B3622',
    darkest: '#142819',
    surface: '#122416',
    pendukung: '#6E8B6E',
  },
  sekunder: {
    DEFAULT: '#B85324',
    hover: '#9E451D',
    dark: '#9E451D',
    light: '#F8EDE7',
  },
  aksen: {
    DEFAULT: '#D48028',
    hover: '#BA6E1E',
    dark: '#9A5814',
    light: '#FAF2E8',
  },
  pendukung: {
    DEFAULT: '#6E8B6E',
    light: '#EFF4EF',
  },
  gelap: {
    DEFAULT: '#4A3525',
    surface: '#38281B',
    muted: '#6B5240',
  },
  netral: {
    DEFAULT: '#E6D7C3',
    canvas: '#F7F4EE',
    border: '#D8C6AE',
    'deep-border': '#1C3A24',
    muted: '#8C7A68',
  },
  cta: {
    DEFAULT: '#2E5339',
    hover: '#24422D',
    light: '#F8EDE7',
    muted: '#EAF0EB',
    accent: '#B85324',
    gold: '#D48028',
  },
  status: {
    success: '#2E5339',
    'success-light': '#EAF0EB',
    warning: '#9A5814',
    'warning-light': '#FEF3C7',
    danger: '#B91C1C',
    'danger-light': '#FEF2F2',
    info: '#1E40AF',
    'info-light': '#EFF6FF',
  },
} as const;

/**
 * Konfigurasi tipografi resmi PasokMataram SIL Open Font License.
 */
export const themeFonts = {
  heading: 'Plus Jakarta Sans',
  body: 'Inter',
  mono: 'JetBrains Mono',
} as const;

