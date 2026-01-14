import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['6f8cd8fe0cc7.ngrok-free.app', 'localhost:3000']
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https' as const,
                hostname: '**',
                pathname: '**'
            }
        ]
    }
};

export default withNextIntl(nextConfig);
