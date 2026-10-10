import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { PwaRegistrar } from '../components/pwa-registrar';
import { EnterpriseJsonLd } from '../components/seo/json-ld';
import '../styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#2E5339',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pasokmataram.com';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
    template: '%s | PasokMataram',
  },
  description:
    'Sistem pengadaan bahan baku dapur restoran, kafe, dan hotel (HoReKa) langsung dari Gapoktan D.I. Yogyakarta (Kulon Progo, Bantul, Sleman). Jadwal subuh terjamin, proteksi escrow 100%, dan bebas tengkulak.',
  keywords: [
    'pengadaan bahan baku restoran jogja',
    'b2b kitchen supply yogyakarta',
    'supplier sayur hotel horeka sleman',
    'distributor bawang merah srikayangan b2b',
    'grosir cabai rawit panjatan kulon progo',
    'supplier beras premium sleman',
    'standing order bahan pangan dapur jogja',
    'rekening escrow supplier pangan indonesia',
    'pengadaan dapur kuliner yogyakarta',
  ],
  authors: [{ name: 'PasokMataram Team', url: 'https://pasokmataram.com' }],
  creator: 'PasokMataram',
  publisher: 'PasokMataram',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: appUrl,
    title: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
    description:
      'Digitalisasi rantai pasok pangan dapur HoReKa langsung ke petani Kulon Progo, Bantul, & Sleman. Pengiriman subuh 04:30 WIB, jaminan QC koki, dan rekening escrow.',
    siteName: 'PasokMataram',
    images: [
      {
        url: '/images/og/pasokmataram-og-cover.png',
        width: 1200,
        height: 630,
        alt: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
    description:
      'Sistem pengadaan dapur restoran & hotel langsung ke Gapoktan DIY. Transaksi aman rekening escrow, drop subuh, hemat biaya s/d 24%.',
    images: ['/images/og/pasokmataram-og-cover.png'],
    creator: '@pasokmataram',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PasokMataram',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.svg', type: 'image/svg+xml', sizes: '192x192' },
    ],
    apple: '/icons/icon.svg',
    shortcut: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col font-body bg-netral-canvas text-gelap antialiased"
      >
        <EnterpriseJsonLd baseUrl={appUrl} />
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
