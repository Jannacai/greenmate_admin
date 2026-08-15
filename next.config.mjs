/** @type {import('next').NextConfig} */
function getApiOrigin() {
  const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3055/api/v1';
  try {
    return new URL(url).origin;
  } catch {
    return 'http://localhost:3055';
  }
}

const apiOrigin = getApiOrigin();
const isProd = process.env.NODE_ENV === 'production';

/**
 * CSP — dev giữ unsafe-eval (HMR Next.js); production siết hơn.
 * @param {boolean} production
 */
function buildContentSecurityPolicy(production) {
  const scriptSrc = production
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "media-src 'self' blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (production) {
    directives.push("object-src 'none'");
  }

  return directives.join('; ');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Video SKU upload — Route Handler tránh giới hạn body Server Action (mặc định 1MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '55mb',
    },
    proxyClientMaxBodySize: '55mb',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      { key: 'Content-Security-Policy', value: buildContentSecurityPolicy(isProd) },
    ];

    if (isProd) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
