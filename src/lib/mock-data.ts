import type { WeatherResponse, ForecastResponse } from '@/lib/types';

export const MOCK_WEATHER: WeatherResponse = {
  location: { city: '서울', country: 'KR' },
  current: {
    temp: 18.4,
    feelsLike: 17.1,
    humidity: 62,
    windSpeed: 3.2,
    windDeg: 225,
    description: '약간의 구름',
    icon: '02d',
    condition: 'Clouds',
  },
};

export const MOCK_FORECAST: ForecastResponse = {
  daily: [
    { date: '2026-04-05', tempMin: 11.2, tempMax: 19.8, description: '약간의 구름', icon: '02d', pop: 0.1 },
    { date: '2026-04-06', tempMin: 13.0, tempMax: 22.3, description: '맑음',       icon: '01d', pop: 0.0 },
    { date: '2026-04-07', tempMin: 14.5, tempMax: 20.1, description: '가벼운 비',  icon: '10d', pop: 0.75 },
    { date: '2026-04-08', tempMin: 10.8, tempMax: 16.4, description: '흐림',       icon: '04d', pop: 0.4 },
    { date: '2026-04-09', tempMin: 9.3,  tempMax: 17.6, description: '맑음',       icon: '01d', pop: 0.05 },
  ],
};
