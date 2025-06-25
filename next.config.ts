import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      new URL('https://s3.eu-west-3.amazonaws.com/**'),
      new URL('https://7el.li/**'),
    ],
  },
}

export default nextConfig
