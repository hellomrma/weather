import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16: Cache Components (PPR) 활성화
  // 'use cache' 디렉티브와 cacheLife()를 사용하기 위해 필요하다.
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
    ],
  },
}

export default nextConfig
