/**
 * @file src/config/business.ts
 * @description Konstanta bisnis dan invarian domain platform PasokMataram.
 * Mematuhi Prinsip VII.4 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

export const paginationConfig = {
  defaultPage: 1,
  defaultLimit: 25,
  maxLimit: 100,
} as const;

export const diyRegenciesConfig = [
  'KOTA_YOGYAKARTA',
  'SLEMAN',
  'BANTUL',
  'GUNUNGKIDUL',
  'KULON_PROGO',
] as const;

export const geoBoundsDiyConfig = {
  minLatitude: -9.0,
  maxLatitude: -7.0,
  minLongitude: 110.0,
  maxLongitude: 111.0,
} as const;

export const kybRulesConfig = {
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'image/webp',
    'image/jpeg',
    'image/png',
  ] as const,
  businessNameMinLength: 3,
  businessNameMaxLength: 100,
  streetAddressMinLength: 10,
  contactPersonMinLength: 3,
} as const;
