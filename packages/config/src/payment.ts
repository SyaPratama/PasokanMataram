/**
 * @file src/config/payment.ts
 * @description Konfigurasi Solosmartpay Payment Gateway dan kebijakan pembayaran.
 * Mematuhi Prinsip VIII.2 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const paymentConfigSchema = z.object({
  token: z.string().min(1),
  webhookSecret: z.string().min(1),
  baseUrl: z.string().url(),
  sandbox: z.boolean().default(false),
  timeoutMs: z.number().int().positive().default(30000),
});

export type PaymentConfig = z.infer<typeof paymentConfigSchema>;

export const paymentConfig: PaymentConfig = paymentConfigSchema.parse({
  token: process.env.SOLOSMARTPAY_TOKEN || 'ssp_test_demo',
  webhookSecret: process.env.SOLOSMARTPAY_WEBHOOK_SECRET || 'demo_webhook_secret',
  baseUrl: process.env.SOLOSMARTPAY_BASE_URL || 'https://api.solosmartpay.com/v1',
  sandbox: process.env.SOLOSMARTPAY_SANDBOX === 'true',
  timeoutMs: 30000,
});

/**
 * Metode pembayaran yang didukung oleh Solosmartpay.
 */
export const PAYMENT_METHODS = {
  QRIS: 'qris',
  VA_BCA: 'va_bca',
  VA_MANDIRI: 'va_mandiri',
  VA_BNI: 'va_bni',
  VA_BRI: 'va_bri',
  VA_BSI: 'va_bsi',
  VA_BPD_DIY: 'va_bpd_diy',
  EWALLET_GOPAY: 'ewallet_gopay',
  EWALLET_DANA: 'ewallet_dana',
  EWALLET_OVO: 'ewallet_ovo',
  EWALLET_SHOPEE: 'ewallet_shopeepay',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

/**
 * Status pembayaran Solosmartpay.
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SETTLED: 'settled',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
