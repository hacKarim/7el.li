import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Uploaded content is never run through the image optimizer: its cache is
    // shared, so it would hand paid files to anyone who asks for them.
    localPatterns: [{ pathname: '/logo.png', search: '' }],
    remotePatterns: [
      new URL('https://s3.eu-west-3.amazonaws.com/**'),
      new URL('https://7el.li/**'),
    ],
  },
  async rewrites() {
    return {
      // Uploads live under public/uploads, which Next would otherwise serve
      // as static files with no access check. Send those requests through
      // the API route that checks ownership or a paid purchase.
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: '/api/files/uploads/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
}

export default nextConfig
