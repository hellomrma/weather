# 지금 날씨

현재 위치의 실시간 날씨와 5일 예보를 제공하는 웹 서비스.  
날씨 상태에 따라 배경 애니메이션이 변하며, API 키 없이도 데모 모드로 미리 확인할 수 있습니다.

## 주요 기능

- **현재 위치 자동 감지** — 브라우저 Geolocation API. 권한 거부 시 서울 기본값 사용
- **실시간 날씨** — 온도, 체감온도, 습도, 풍속/풍향
- **5일 예보** — 일별 최고·최저 기온, 강수 확률
- **날씨별 Canvas 애니메이션** — 비, 눈, 별, 번개, 안개 등 8가지 효과
- **데모 모드** — `?demo=true` 파라미터로 API 없이 UI 확인
- **PWA** — 홈 화면 추가, 오프라인 메타데이터

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 날씨 데이터 | OpenWeatherMap API |
| 배포 | Vercel |

## 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/<username>/weather.git
cd weather
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 값을 입력합니다.

```bash
# OpenWeatherMap API 키 (필수)
# https://openweathermap.org 에서 무료 발급 — 활성화까지 최대 2시간 소요
OPENWEATHERMAP_API_KEY=your_api_key_here

# 배포 도메인 (SEO용, 선택)
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

> API 키가 없거나 아직 활성화 전이라면 **데모 모드**로 확인하세요:  
> [http://localhost:3000/?demo=true](http://localhost:3000/?demo=true)

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # SEO 메타데이터, JSON-LD, 폰트
│   ├── page.tsx            # 메인 페이지 (데모 모드 포함)
│   ├── sitemap.ts          # /sitemap.xml
│   ├── robots.ts           # /robots.txt
│   └── api/
│       ├── weather/route.ts    # GET /api/weather?lat=&lon=
│       └── forecast/route.ts   # GET /api/forecast?lat=&lon=
├── components/
│   ├── WeatherBackground.tsx   # Canvas 배경 애니메이션
│   ├── WeatherCard.tsx         # 현재 날씨 카드
│   ├── ForecastList.tsx        # 5일 예보 목록
│   ├── WeatherIcon.tsx         # 날씨 아이콘
│   ├── LocationStatus.tsx      # 위치 상태 표시
│   └── JsonLd.tsx              # 구조화 데이터 (SEO/AEO)
├── hooks/
│   ├── useGeolocation.ts   # Geolocation API 래퍼
│   └── useWeather.ts       # 날씨 데이터 fetch + 상태
└── lib/
    ├── weather-api.ts      # OWM API 클라이언트 (서버 전용)
    ├── types.ts            # 공유 TypeScript 타입
    └── mock-data.ts        # 데모 모드용 목업 데이터
```

## 날씨별 배경 효과

| 날씨 | 배경 | 애니메이션 |
|------|------|---------|
| 맑음 (낮) | 황금→오렌지→하늘 | 반짝이 파티클 + 태양 글로우 |
| 맑음 (밤) | 남색→짙은 파랑 | 별 깜빡임 + 초승달 |
| 구름 | 슬레이트 회색 | 흘러가는 구름 |
| 비 / 소나기 | 짙은 파랑-회색 | 대각선 빗줄기 |
| 뇌우 | 짙은 보라-검정 | 빗줄기 + 번개 플래시 |
| 눈 | 연파랑-흰색 | 흔들리며 떨어지는 눈송이 |
| 안개 / 연무 | 회색-베이지 | 반투명 안개 블롭 |

## 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

## Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/<username>/weather)

1. 위 버튼 클릭 또는 Vercel 대시보드에서 저장소 연결
2. 환경변수 등록: `OPENWEATHERMAP_API_KEY`, `NEXT_PUBLIC_BASE_URL`
3. Deploy

자세한 배포 가이드: [`_workspace/05_deploy_guide.md`](./_workspace/05_deploy_guide.md)

## API

| 엔드포인트 | 설명 | 캐시 |
|-----------|------|------|
| `GET /api/weather?lat=&lon=` | 현재 날씨 | 10분 |
| `GET /api/forecast?lat=&lon=` | 5일 예보 | 1시간 |

자세한 명세: [`_workspace/02_api_spec.md`](./_workspace/02_api_spec.md)

## 라이선스

MIT
