import type { WeatherResponse, ForecastResponse, AirQualityResponse } from '@/lib/types';

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
  hourly: [
    { dt: 1775372400, hour: 16, temp: 18.4, description: '약간의 구름', icon: '02d', pop: 0.0 },
    { dt: 1775383200, hour: 19, temp: 16.2, description: '약간의 구름', icon: '02n', pop: 0.0 },
    { dt: 1775394000, hour: 22, temp: 14.1, description: '맑음',       icon: '01n', pop: 0.0 },
    { dt: 1775404800, hour: 1,  temp: 12.6, description: '맑음',       icon: '01n', pop: 0.0 },
    { dt: 1775415600, hour: 4,  temp: 11.4, description: '맑음',       icon: '01n', pop: 0.05 },
    { dt: 1775426400, hour: 7,  temp: 12.0, description: '맑음',       icon: '01d', pop: 0.05 },
    { dt: 1775437200, hour: 10, temp: 16.8, description: '맑음',       icon: '01d', pop: 0.0 },
    { dt: 1775448000, hour: 13, temp: 20.5, description: '맑음',       icon: '01d', pop: 0.0 },
  ],
};

export const MOCK_AIR: AirQualityResponse = { aqi: 2, pm25: 18, pm10: 34 };
