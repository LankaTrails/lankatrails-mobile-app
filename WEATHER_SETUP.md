# Weather API Setup Instructions

## Overview
The weather feature now fetches real-time weather data based on the location and date of your trip days. Here's how to set it up:

## 1. Get OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

## 2. Configure the API Key

Open `/services/weatherService.ts` and replace the placeholder:

```typescript
private readonly API_KEY = 'your_openweather_api_key'; // Replace with your actual API key
```

## 3. How it Works

### Weather Data Fetching
- **Current Weather**: For today's date and past dates
- **5-Day Forecast**: For dates up to 5 days in the future
- **Fallback Weather**: For dates beyond 5 days, uses Sri Lanka's seasonal patterns

### Location Detection
The system automatically detects locations from your trip services:
- Uses the first service's location for each day
- Falls back to major Sri Lankan cities (Colombo, Kandy, Galle, etc.)
- Includes coordinates for accurate weather data

### Weather Conditions
Supports 5 weather conditions with appropriate icons:
- ☀️ **Sunny**: Clear skies
- ☁️ **Cloudy**: Overcast or partly cloudy
- 🌧️ **Rainy**: Rain or drizzle
- ⛈️ **Stormy**: Thunderstorms
- ❄️ **Snowy**: Snow (rare in Sri Lanka, but supported)

## 4. Features

### Real-Time Updates
- Weather data is fetched when trip days are loaded
- Shows current temperature alongside weather condition
- Updates automatically based on location and date

### Fallback System
- If API is unavailable, uses Sri Lanka's typical weather patterns
- Considers monsoon seasons (Southwest: May-Sep, Northeast: Oct-Jan)
- Adjusts for geographical differences (hill country vs coastal)

### Performance
- Batch weather requests for multiple days
- Caches weather data in component state
- Error handling with graceful fallbacks

## 5. Customization

### Adding More Cities
Add coordinates to the `SRI_LANKA_CITIES` object in `weatherService.ts`:

```typescript
const SRI_LANKA_CITIES: { [key: string]: LocationCoordinates } = {
  'your_city': { latitude: 0.0000, longitude: 0.0000, city: 'Your City' },
  // ... existing cities
};
```

### Different Weather API
Replace the OpenWeatherMap implementation with your preferred weather service by updating the API endpoints and response mapping in `weatherService.ts`.

## 6. Testing

### With API Key
- Real weather data for current and future dates
- Temperature display in weather container
- Accurate weather conditions based on location

### Without API Key
- Fallback to seasonal weather patterns
- Still shows appropriate weather icons
- Graceful degradation with console warnings

## 7. Cost Considerations

OpenWeatherMap Free Tier:
- 1,000 API calls per day
- Current weather and 5-day forecast
- Perfect for personal projects

For production apps with high usage, consider upgrading to a paid plan or implementing request caching.