/**
 * JSON-LD 구조화 데이터 컴포넌트
 * AEO (Answer Engine Optimization) — AI 검색엔진·음성검색 응답 최적화
 */
export function JsonLd() {
  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '지금 날씨',
    alternateName: ['날씨 서비스', '실시간 날씨', 'Weather Now'],
    url: 'https://weather-now.vercel.app',
    description:
      '현재 위치의 실시간 날씨와 5일 예보를 확인하는 웹 서비스입니다. 온도, 체감온도, 습도, 풍속 등 상세 기상 정보를 제공합니다.',
    applicationCategory: 'WeatherApplication',
    operatingSystem: 'All',
    browserRequirements: 'HTML5, Geolocation API',
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    featureList: [
      '현재 위치 자동 감지',
      '실시간 기온·체감온도',
      '습도·풍속·풍향 정보',
      '5일간 날씨 예보',
      '날씨 상태별 시각적 배경 애니메이션',
    ],
    screenshot: 'https://weather-now.vercel.app/og-image.png',
    provider: {
      '@type': 'Organization',
      name: '지금 날씨',
      url: 'https://weather-now.vercel.app',
    },
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '지금 내 위치 날씨가 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '브라우저의 위치 정보 권한을 허용하면 현재 위치의 기온, 체감온도, 습도, 풍속을 실시간으로 확인할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '오늘 날씨 예보는 어디서 볼 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '지금 날씨 서비스에서 오늘을 포함한 5일간의 날씨 예보(최고·최저 기온, 강수 확률)를 제공합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '위치 권한을 허용하지 않으면 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '위치 권한을 거부해도 서울의 날씨를 기본으로 표시합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '날씨 정보는 얼마나 자주 업데이트되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '현재 날씨는 10분마다, 5일 예보는 1시간마다 최신 데이터로 갱신됩니다.',
        },
      },
    ],
  };

  const speakable = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://weather-now.vercel.app',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakable) }}
      />
    </>
  );
}
