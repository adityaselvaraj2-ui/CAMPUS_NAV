export interface WeatherData {
  temp: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

export const CAMPUS_COORDS = {
  sjce: { lat: 12.8696, lon: 80.2163 },
  sjit: { lat: 12.8694, lon: 80.2196 },
  cit:  { lat: 11.0283, lon: 77.0268 },
};

export function weatherCodeToEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

export async function fetchCampusWeather(campusId: string): Promise<WeatherData | null> {
  const coords = CAMPUS_COORDS[campusId as keyof typeof CAMPUS_COORDS];
  if (!coords) return null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      windSpeed: Math.round(data.current.wind_speed_10m),
      humidity: data.current.relative_humidity_2m,
    };
  } catch { return null; }
}
