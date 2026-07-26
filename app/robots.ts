import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'],
    },
    sitemap: 'https://ebookvala.com/sitemap.xml',
  };
}
