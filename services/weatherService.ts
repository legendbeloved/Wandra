export const WeatherService = {
  async getWeather(lat: number, lng: number): Promise<{ condition: string; icon: string }> {
    // In a real app, we'd fetch from OpenWeatherMap or similar
    // For now, we'll simulate based on time and random chance
    const hour = new Date().getHours();
    const isDay = hour > 6 && hour < 18;
    
    const conditions = [
      { condition: 'Clear', icon: isDay ? '☀️' : '🌙' },
      { condition: 'Cloudy', icon: '☁️' },
      { condition: 'Rainy', icon: '🌧️' },
      { condition: 'Breezy', icon: '🌬️' },
    ];
    
    const random = Math.floor(Math.random() * conditions.length);
    return conditions[random];
  },

  async getPlaceName(lat: number, lng: number): Promise<string> {
    if (!navigator.onLine) {
      return `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      const data = await response.json();
      return data.display_name.split(',')[0] || 'Unknown Place';
    } catch (error) {
      return 'Somewhere Beautiful';
    }
  }
};
