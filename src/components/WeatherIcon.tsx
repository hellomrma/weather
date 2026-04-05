import Image from 'next/image';

interface WeatherIconProps {
  icon: string;         // OWM 아이콘 코드 (예: "01d", "10n")
  description: string;  // 날씨 설명 (alt 텍스트로 사용)
  size?: number;        // 이미지 크기 (기본값: 64)
}

export function WeatherIcon({ icon, description, size = 64 }: WeatherIconProps) {
  const src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <Image
      src={src}
      alt={description}
      width={size}
      height={size}
      priority={false}
    />
  );
}
