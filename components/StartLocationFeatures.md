# Start Location Selection with Interactive Map

## Overview

The StartLocationModal component now supports three methods for selecting a start location:

1. **Device Location** - Automatically detect current GPS location
2. **Interactive Map** - Visual map selection with popular locations
3. **Address Search** - Text-based location search

## Interactive Map Features

### Full-Screen Map Experience

- **MapLocationPicker Component**: A dedicated full-screen map interface
- **React Native Maps Integration**: Uses `react-native-maps` with Google Maps
- **Tap to Select**: Users can tap anywhere on the map to select their start location
- **Real-time Coordinates**: Shows latitude/longitude of selected location
- **Address Resolution**: Automatically converts coordinates to readable addresses using reverse geocoding

### Enhanced User Experience

- **Current Location Button**: Quick access to user's current GPS location
- **Popular Regions**: Quick navigation buttons for major Sri Lankan cities:
  - Colombo
  - Kandy
  - Galle
  - Nuwara Eliya
  - Anuradhapura
- **Visual Feedback**: Selected location is marked with a blue pin
- **Coordinate Display**: Shows exact coordinates in a floating info box

### Popular Start Locations

Pre-populated list of common starting points:

- Bandaranaike International Airport (Katunayake)
- Colombo Fort Railway Station
- Galle Face Green
- Kandy City Center
- Ella Railway Station
- Unawatuna Beach

## Technical Implementation

### Location Data Structure

All location selections return a standardized `Location` object with:

```typescript
{
  locationId: null, // As requested for start locations
  formattedAddress: string,
  city: string,
  district: string,
  province: string,
  country: string,
  postalCode: string,
  latitude: number,
  longitude: number
}
```

### Map Configuration

- **Initial Region**: Centered on Sri Lanka (7.8731°N, 80.7718°E)
- **Map Type**: Standard view with user location enabled
- **Zoom Levels**: Dynamic based on selection method
- **Bounds Validation**: Warns users if coordinates are outside Sri Lanka

### Integration with Trip Creation Flow

- **Sequential Flow**: Start Location → Destinations → Trip Name → Trip Details
- **Data Validation**: Ensures start location is selected before proceeding
- **Error Handling**: Graceful fallbacks if location services fail
- **State Management**: Proper cleanup when modals close

## User Journey

1. **Trip Creation Initiated**: StartLocationModal opens first
2. **Method Selection**: User chooses how to set start location
3. **Location Selection**:
   - Device: Automatic GPS detection
   - Map: Interactive visual selection
   - Search: Text-based address lookup
4. **Confirmation**: Location is validated and formatted
5. **Next Step**: Proceeds to destination selection

## Error Handling

- **Permission Denied**: Graceful fallback to manual methods
- **GPS Unavailable**: Alternative location methods offered
- **Network Issues**: Cached data and offline functionality
- **Invalid Coordinates**: Validation with user confirmation for out-of-bounds locations

## Accessibility Features

- **Touch Targets**: Large buttons for easy interaction
- **Visual Feedback**: Clear selection states and loading indicators
- **Alternative Methods**: Multiple ways to achieve the same goal
- **Error Messages**: Clear, actionable error descriptions

This implementation provides a comprehensive, user-friendly way to select start locations while maintaining the `locationId: null` requirement for start locations as requested.
