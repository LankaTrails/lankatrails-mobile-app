// Weather types
export interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  city?: string;
}

// Sri Lanka major cities coordinates for fallback
const SRI_LANKA_CITIES: { [key: string]: LocationCoordinates } = {
  'colombo': { latitude: 6.9271, longitude: 79.8612, city: 'Colombo' },
  'kandy': { latitude: 7.2906, longitude: 80.6337, city: 'Kandy' },
  'galle': { latitude: 6.0535, longitude: 80.2210, city: 'Galle' },
  'sigiriya': { latitude: 7.9568, longitude: 80.7598, city: 'Sigiriya' },
  'nuwara eliya': { latitude: 6.9497, longitude: 80.7891, city: 'Nuwara Eliya' },
  'bentota': { latitude: 6.4263, longitude: 79.9956, city: 'Bentota' },
  'habarana': { latitude: 8.0323, longitude: 80.7517, city: 'Habarana' },
  'minneriya': { latitude: 8.0167, longitude: 80.8833, city: 'Minneriya' },
};

class WeatherService {
  private readonly API_KEY = 'your_openweather_api_key'; // Replace with your API key
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  /**
   * Get coordinates for a location (city name or exact coordinates)
   */
  private getLocationCoordinates(location: string): LocationCoordinates | null {
    const normalizedLocation = location.toLowerCase().trim();
    
    // Check if it's a known Sri Lankan city
    for (const [city, coords] of Object.entries(SRI_LANKA_CITIES)) {
      if (normalizedLocation.includes(city)) {
        return coords;
      }
    }
    
    // Default to Colombo if no match found
    return SRI_LANKA_CITIES.colombo;
  }

  /**
   * Map OpenWeatherMap weather codes to our simplified conditions
   */
  private mapWeatherCondition(weatherCode: number, weatherMain: string): 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' {
    // Thunderstorm
    if (weatherCode >= 200 && weatherCode < 300) return 'stormy';
    
    // Drizzle and Rain
    if (weatherCode >= 300 && weatherCode < 600) return 'rainy';
    
    // Snow
    if (weatherCode >= 600 && weatherCode < 700) return 'snowy';
    
    // Atmosphere (mist, fog, etc.)
    if (weatherCode >= 700 && weatherCode < 800) return 'cloudy';
    
    // Clear
    if (weatherCode === 800) return 'sunny';
    
    // Clouds
    if (weatherCode > 800) return 'cloudy';
    
    // Fallback based on main weather type
    switch (weatherMain.toLowerCase()) {
      case 'clear': return 'sunny';
      case 'clouds': return 'cloudy';
      case 'rain': return 'rainy';
      case 'thunderstorm': return 'stormy';
      case 'snow': return 'snowy';
      default: return 'sunny';
    }
  }

  /**
   * Fetch current weather for a location
   */
  async getCurrentWeather(location: string): Promise<WeatherData | null> {
    try {
      const coordinates = this.getLocationCoordinates(location);
      if (!coordinates) {
        console.warn(`Could not find coordinates for location: ${location}`);
        return null;
      }

      const response = await fetch(
        `${this.BASE_URL}/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        condition: this.mapWeatherCondition(data.weather[0].id, data.weather[0].main),
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  /**
   * Fetch weather forecast for a specific date (up to 5 days ahead)
   */
  async getWeatherForecast(location: string, targetDate: string): Promise<WeatherData | null> {
    try {
      const coordinates = this.getLocationCoordinates(location);
      if (!coordinates) {
        console.warn(`Could not find coordinates for location: ${location}`);
        return null;
      }

      const today = new Date();
      const target = new Date(targetDate);
      const daysDiff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // If the date is in the past or today, get current weather
      if (daysDiff <= 0) {
        return this.getCurrentWeather(location);
      }

      // If the date is more than 5 days in the future, OpenWeatherMap free tier doesn't support it
      if (daysDiff > 5) {
        console.warn(`Weather forecast only available for next 5 days. Requested: ${daysDiff} days ahead`);
        return this.getFallbackWeather(location, targetDate);
      }

      const response = await fetch(
        `${this.BASE_URL}/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Find the forecast closest to the target date
      const targetTimestamp = target.getTime();
      let closestForecast = data.list[0];
      let smallestDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - targetTimestamp);

      for (const forecast of data.list) {
        const forecastTime = new Date(forecast.dt * 1000).getTime();
        const diff = Math.abs(forecastTime - targetTimestamp);
        
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestForecast = forecast;
        }
      }

      return {
        condition: this.mapWeatherCondition(closestForecast.weather[0].id, closestForecast.weather[0].main),
        temperature: Math.round(closestForecast.main.temp),
        humidity: closestForecast.main.humidity,
        description: closestForecast.weather[0].description,
        icon: closestForecast.weather[0].icon,
      };
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getFallbackWeather(location, targetDate);
    }
  }

  /**
   * Get fallback weather based on Sri Lanka's typical weather patterns
   */
  private getFallbackWeather(location: string, date: string): WeatherData {
    const month = new Date(date).getMonth() + 1; // 1-12
    const normalizedLocation = location.toLowerCase();
    
    // Sri Lanka weather patterns
    let condition: 'sunny' | 'cloudy' | 'rainy' = 'sunny';
    let temperature = 28; // Default temperature
    
    // Monsoon seasons in Sri Lanka
    if (month >= 5 && month <= 9) {
      // Southwest monsoon (May-September) - affects west and south
      if (normalizedLocation.includes('colombo') || 
          normalizedLocation.includes('galle') || 
          normalizedLocation.includes('bentota')) {
        condition = 'rainy';
        temperature = 26;
      }
    } else if (month >= 10 && month <= 1) {
      // Northeast monsoon (October-January) - affects north and east
      if (normalizedLocation.includes('sigiriya') || 
          normalizedLocation.includes('habarana') || 
          normalizedLocation.includes('minneriya')) {
        condition = 'rainy';
        temperature = 25;
      }
    }
    
    // Hill country is generally cooler
    if (normalizedLocation.includes('kandy') || 
        normalizedLocation.includes('nuwara eliya')) {
      temperature = temperature - 8;
      condition = month >= 4 && month <= 6 ? 'rainy' : 'cloudy';
    }
    
    return {
      condition,
      temperature,
      humidity: condition === 'rainy' ? 85 : 70,
      description: `Typical ${condition} weather for ${location}`,
      icon: condition === 'sunny' ? '01d' : condition === 'cloudy' ? '03d' : '10d',
    };
  }

  /**
   * Batch fetch weather for multiple locations and dates
   */
  async getBatchWeather(requests: { location: string; date: string }[]): Promise<(WeatherData | null)[]> {
    const promises = requests.map(({ location, date }) => 
      this.getWeatherForecast(location, date)
    );
    
    return Promise.all(promises);
  }
}

export const weatherService = new WeatherService();
export default weatherService;