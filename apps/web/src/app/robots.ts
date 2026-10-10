import { MetadataRoute } from 'next';

/**
 * @file src/app/robots.ts
 * @description Generator robots.txt native Next.js 14 App Router.
 * Mengizinkan pengindeksan halaman publik oleh Googlebot & Bingbot dan memblokir endpoint internal API.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pasokmataram.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
