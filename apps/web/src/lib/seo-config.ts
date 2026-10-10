/**
 * @file src/lib/seo-config.ts
 * @description Konfigurasi default SEO & OpenGraph untuk platform PasokMataram.
 * Menyelaraskan standar metadata dan package next-seo dengan Next.js 14 App Router.
 */

export interface SeoConfig {
  title: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  canonical: string;
  openGraph: {
    type: string;
    locale: string;
    url: string;
    siteName: string;
    title: string;
    description: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  };
  twitter: {
    handle: string;
    site: string;
    cardType: string;
  };
  keywords: string[];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pasokmataram.com';

export const defaultSeoConfig: SeoConfig = {
  title: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
  defaultTitle: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
  titleTemplate: '%s | PasokMataram',
  description:
    'Sistem pengadaan bahan baku dapur restoran & hotel langsung dari Gapoktan D.I. Yogyakarta (Kulon Progo, Bantul, Sleman). Jadwal subuh terjamin, proteksi escrow 100%, dan bebas tengkulak.',
  canonical: APP_URL,
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: APP_URL,
    siteName: 'PasokMataram',
    title: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
    description:
      'Digitalisasi rantai pasok pangan dapur HoReKa langsung ke petani Kulon Progo, Bantul, & Sleman. Pengiriman subuh 04:30 WIB, jaminan QC koki, dan rekening escrow.',
    images: [
      {
        url: `${APP_URL}/images/og/pasokmataram-og-cover.png`,
        width: 1200,
        height: 630,
        alt: 'PasokMataram: Pengadaan Bahan Baku Dapur Kuliner D.I. Yogyakarta',
      },
    ],
  },
  twitter: {
    handle: '@pasokmataram',
    site: '@pasokmataram',
    cardType: 'summary_large_image',
  },
  keywords: [
    'pengadaan bahan baku restoran jogja',
    'b2b kitchen supply yogyakarta',
    'supplier sayur hotel horeka sleman',
    'distributor bawang merah srikayangan b2b',
    'grosir cabai rawit panjatan kulon progo',
    'supplier beras premium sleman',
  ],
};
