import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.monlogementetudiant.com'; // Domain from footer

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/account/', '/api/', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
