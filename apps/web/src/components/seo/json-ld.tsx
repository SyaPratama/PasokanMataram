/**
 * @file src/components/seo/json-ld.tsx
 * @description Enterprise Structured Data (JSON-LD) Schemas untuk PasokMataram.
 * Menghasilkan skema W3C / Schema.org yang valid untuk Google Rich Results:
 * - Organization: Entitas PasokMataram & Wilayah D.I. Yogyakarta
 * - BreadcrumbList: Hirarki navigasi remah roti untuk Google Sitelinks
 * - Product & AggregateOffer: Katalog kuota pooling pangan sentra DIY
 */

import React from 'react';

interface JsonLdProps {
  baseUrl?: string;
}

export function EnterpriseJsonLd({ baseUrl = 'https://pasokmataram.com' }: JsonLdProps) {
  // 1. Skema Organization (Entitas Perusahaan & Area Layanan HoReKa)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'PasokMataram',
    legalName: 'PasokMataram (PT Pasok Mataram Nusantara)',
    url: baseUrl,
    logo: `${baseUrl}/icons/icon-512.svg`,
    image: `${baseUrl}/images/og/pasokmataram-og-cover.png`,
    description:
      'Platform Pengadaan Bahan Baku Dapur HoReKa Langsung dari Gapoktan D.I. Yogyakarta dengan Sistem Standing Order, Proteksi Escrow, dan PWA.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bantul',
      addressRegion: 'Daerah Istimewa Yogyakarta',
      addressCountry: 'ID',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Kota Yogyakarta' },
      { '@type': 'AdministrativeArea', name: 'Kabupaten Sleman' },
      { '@type': 'AdministrativeArea', name: 'Kabupaten Bantul' },
      { '@type': 'AdministrativeArea', name: 'Kabupaten Kulon Progo' },
      { '@type': 'AdministrativeArea', name: 'Kabupaten Gunungkidul' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support & kitchen procurement',
      telephone: '+62-274-555-1234',
      availableLanguage: ['Indonesian', 'English'],
    },
    sameAs: ['https://pasokmataram.com'],
  };

  // 2. Skema BreadcrumbList (Struktur SERP Navigasi)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Alur Pengadaan Dapur HoReKa',
        item: `${baseUrl}/#alur-pengadaan`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Katalog Komoditas Sentra DIY',
        item: `${baseUrl}/#komoditas`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Pendaftaran KYB B2B',
        item: `${baseUrl}/register`,
      },
    ],
  };

  // 3. Skema Product & AggregateOffer (Pooling Kuota Komoditas Pangan)
  const commodityProductsSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/#product-bawang-srikayangan`,
    name: 'Bawang Merah Srikayangan Grade A (Pooling Panen B2B)',
    image: `${baseUrl}/images/commodities/bawang-merah-srikayangan.webp`,
    description:
      'Komoditas bawang merah unggulan sentra panen Srikayangan Kulon Progo dengan kalibrasi timbangan digital presisi di Hub Transit Bantul untuk dapur restoran & hotel D.I. Yogyakarta.',
    sku: 'PASOK-KULONPROGO-BMR-01',
    category: 'Bahan Baku Pangan Komersial / HoReKa',
    brand: {
      '@type': 'Brand',
      name: 'Sentra Srikayangan Kulon Progo',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'IDR',
      lowPrice: 24500,
      highPrice: 28000,
      offerCount: 1000,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Gapoktan Srikayangan & PasokMataram Escrow',
      },
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        minValue: 25,
        unitCode: 'KGM',
      },
    },
  };

  // 4. Skema WebSite & Sitelinks Search Box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'PasokMataram',
    description: 'Sistem Pengadaan Bahan Baku Dapur Restoran Langsung ke Petani D.I. Yogyakarta',
    inLanguage: 'id-ID',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(commodityProductsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
