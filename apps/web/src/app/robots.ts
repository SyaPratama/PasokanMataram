import { MetadataRoute } from 'next';

/**
 * @file src/app/robots.ts
 * @description Generator robots.txt native Next.js 14 App Router.
 * Mengizinkan pengindeksan halaman publik oleh mesin pencari dan memblokir area privat terproteksi.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pasokmataram.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/buyer/',
          '/supplier/',
          '/hub/',
          '/tenants/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
