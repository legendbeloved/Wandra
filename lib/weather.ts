/**
 * Weather Utility
 * Uses OpenWeatherMap API - Free Tier
 */

export async function getWeather(lat: number, lng: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather service unavailable');
    }

    const data = await response.json();
    return {
      condition: data.weather[0].main,
      temp: data.main.temp,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Weather Error:', error);
    return null;
  }
}
