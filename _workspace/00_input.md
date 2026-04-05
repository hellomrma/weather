# 사용자 요구사항 정리

## 앱 설명
현재 위치 기반 날씨 서비스 웹앱

## 핵심 기능
1. **위치 감지**: 브라우저 Geolocation API로 사용자 현재 위치(위도/경도) 자동 감지
2. **현재 날씨**: 온도, 체감온도, 습도, 풍속/풍향, 날씨 상태(맑음/흐림/비 등), 날씨 아이콘
3. **일주일 예보**: 7일간 일별 최고/최저 기온, 날씨 아이콘, 강수 확률
4. **날씨 아이콘**: OpenWeatherMap 아이콘 or 커스텀 SVG 아이콘
5. **반응형 UI**: 모바일/태블릿/데스크톱 대응

## 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **날씨 API**: OpenWeatherMap (무료 플랜)
  - Current Weather API
  - 5 Day / 3 Hour Forecast API (무료 플랜에서 7일 예보 대체)
- **배포**: Vercel

## 규모
MVP — 소규모 단일 페이지 앱

## 환경변수
- `OPENWEATHERMAP_API_KEY`: OpenWeatherMap API 키 (서버사이드에서만 사용)

## 가정 사항
- OpenWeatherMap 무료 플랜 기준 (5일/3시간 예보 API 사용, 최대 5일)
- 위치 권한 거부 시 기본 위치(서울) 표시
- 별도 DB/인증 없음 (순수 날씨 조회 서비스)
- 단위: 섭씨(°C), m/s
