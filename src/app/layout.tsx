import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { JsonLd } from '@/components/JsonLd';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ─── 기본 URL (배포 후 실제 도메인으로 교체) ───────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://weather-now.vercel.app';

// ─── Viewport & Theme Color ────────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#38bdf8' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f172a' },
  ],
};

// ─── SEO / OG / Twitter / GEO 메타데이터 ──────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── 기본 SEO ──────────────────────────────────────────────────────────────
  title: {
    default:  '지금 날씨 — 현재 위치 실시간 날씨',
    template: '%s | 지금 날씨',
  },
  description:
    '현재 위치의 실시간 날씨와 5일 예보를 확인하세요. 기온·체감온도·습도·풍속·강수 확률을 한눈에 제공합니다.',
  keywords: [
    '날씨', '실시간 날씨', '현재 날씨', '오늘 날씨', '내일 날씨',
    '날씨 예보', '5일 예보', '기온', '체감온도', '습도', '풍속',
    '강수 확률', 'weather', 'weather forecast', 'current weather',
  ],
  authors:   [{ name: '지금 날씨', url: BASE_URL }],
  creator:   '지금 날씨',
  publisher: '지금 날씨',
  category:  'weather',

  // ── 크롤링 ────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
    languages: { 'ko-KR': BASE_URL },
  },

  // ── Open Graph (SNS 공유) ─────────────────────────────────────────────────
  openGraph: {
    type:        'website',
    locale:      'ko_KR',
    url:         BASE_URL,
    siteName:    '지금 날씨',
    title:       '지금 날씨 — 현재 위치 실시간 날씨',
    description: '현재 위치의 실시간 날씨와 5일 예보를 확인하세요.',
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    '지금 날씨 — 현재 위치 실시간 날씨 서비스',
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────────────────────
  twitter: {
    card:        'summary_large_image',
    title:       '지금 날씨 — 현재 위치 실시간 날씨',
    description: '현재 위치의 실시간 날씨와 5일 예보를 확인하세요.',
    images:      ['/og-image.png'],
  },

  // ── GEO 메타태그 (위치 기반 검색 최적화) ──────────────────────────────────
  other: {
    'geo.region':    'KR',
    'geo.placename': 'South Korea',
    // AEO — 음성 검색 / 모바일 최적화
    'format-detection':           'telephone=no',
    'mobile-web-app-capable':     'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': '지금 날씨',
  },

  // ── 앱 아이콘 ─────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },

  // ── PWA manifest ──────────────────────────────────────────────────────────
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
