/**
 * @file src/config/payment.ts
 * @description Multi-provider payment gateway configuration.
 * Mematuhi Prinsip VIII.2 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

export const PAYMENT_PROVIDERS = {
  SOLOSMARTPAY: 'solosmartpay',
  XENDIT: 'xendit',
  DUITKU: 'duitku',
  MIDTRANS: 'midtrans',
} as const;

export type PaymentProvider = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS];

const solosmartpaySchema = z.object({
  token: z.string().min(1),
  webhookSecret: z.string().min(1),
  baseUrl: z.string().url(),
  sandbox: z.boolean().default(false),
  timeoutMs: z.number().int().positive().default(30000),
});

const xenditSchema = z.object({
  secretKey: z.string().min(1),
  webhookToken: z.string().min(1),
  baseUrl: z.string().url(),
  sandbox: z.boolean().default(false),
  timeoutMs: z.number().int().positive().default(30000),
});

const duitkuSchema = z.object({
  merchantCode: z.string().min(1),
  apiKey: z.string().min(1),
  webhookSecret: z.string().min(1),
  baseUrl: z.string().url(),
  sandbox: z.boolean().default(false),
  timeoutMs: z.number().int().positive().default(30000),
});

const midtransSchema = z.object({
  serverKey: z.string().min(1),
  clientKey: z.string().min(1),
  webhookSecret: z.string().min(1),
  baseUrl: z.string().url(),
  sandbox: z.boolean().default(false),
  timeoutMs: z.number().int().positive().default(30000),
});

export type SolosmartpayConfig = z.infer<typeof solosmartpaySchema>;
export type XenditConfig       = z.infer<typeof xenditSchema>;
export type DuitkuConfig       = z.infer<typeof duitkuSchema>;
export type MidtransConfig     = z.infer<typeof midtransSchema>;

export const paymentProviderConfigs = {
  solosmartpay: solosmartpaySchema.parse({
    token:         process.env.SOLOSMARTPAY_TOKEN          || 'ssp_test_demo',
    webhookSecret: process.env.SOLOSMARTPAY_WEBHOOK_SECRET || 'demo_webhook_secret',
    baseUrl:       process.env.SOLOSMARTPAY_BASE_URL       || 'https://api.solosmartpay.com/v1',
    sandbox:       process.env.SOLOSMARTPAY_SANDBOX === 'true',
    timeoutMs:     30000,
  }),
  xendit: xenditSchema.parse({
    secretKey:    process.env.XENDIT_SECRET_KEY    || 'xnd_development_demo',
    webhookToken: process.env.XENDIT_WEBHOOK_TOKEN || 'demo_xendit_token',
    baseUrl:      process.env.XENDIT_BASE_URL      || 'https://api.xendit.co',
    sandbox:      process.env.XENDIT_SANDBOX === 'true',
    timeoutMs:    30000,
  }),
  duitku: duitkuSchema.parse({
    merchantCode:  process.env.DUITKU_MERCHANT_CODE  || 'D0001',
    apiKey:        process.env.DUITKU_API_KEY         || 'demo_api_key',
    webhookSecret: process.env.DUITKU_WEBHOOK_SECRET  || 'demo_webhook_secret',
    baseUrl:       process.env.DUITKU_BASE_URL        || 'https://passport.duitku.com/webapi',
    sandbox:       process.env.DUITKU_SANDBOX === 'true',
    timeoutMs:     30000,
  }),
  midtrans: midtransSchema.parse({
    serverKey:     process.env.MIDTRANS_SERVER_KEY     || 'SB-Mid-server-demo',
    clientKey:     process.env.MIDTRANS_CLIENT_KEY     || 'SB-Mid-client-demo',
    webhookSecret: process.env.MIDTRANS_WEBHOOK_SECRET || 'demo_webhook_secret',
    baseUrl:       process.env.MIDTRANS_BASE_URL       || 'https://api.sandbox.midtrans.com/v2',
    sandbox:       process.env.MIDTRANS_SANDBOX !== 'false',
    timeoutMs:     30000,
  }),
} as const;

/** Active provider key — controlled by PAYMENT_PROVIDER env var */
export const activePaymentProvider: PaymentProvider =
  (process.env.PAYMENT_PROVIDER as PaymentProvider) ?? 'solosmartpay';

/** Legacy alias kept for existing consumers; resolves to active provider's config */
export const paymentConfig = paymentProviderConfigs[activePaymentProvider];
export type PaymentConfig = SolosmartpayConfig | XenditConfig | DuitkuConfig | MidtransConfig;

/**
 * Metode pembayaran yang didukung.
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
 * Status pembayaran.
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
