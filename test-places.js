// Quick test script to validate Google Places API
const axios = require('axios');

const GOOGLE_PLACES_API_KEY = 'AIzaSyA47Q-I515EK0DU4pvk5jgUcatYcdnf8cY';

async function testGooglePlacesAPI() {
  console.log('🔍 Testing Google Places API...');
  
  try {
    // Test nearby search
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: '6.0329,80.2168', // Galle coordinates
        radius: 10000,
        type: 'tourist_attraction',
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    console.log('✅ API Response Status:', response.data.status);
    console.log('📊 Number of places found:', response.data.results?.length || 0);
    
    if (response.data.results?.length > 0) {
      console.log('📍 Sample place:', {
        name: response.data.results[0].name,
        vicinity: response.data.results[0].vicinity,
        rating: response.data.results[0].rating,
        place_id: response.data.results[0].place_id,
      });
    }

    if (response.data.status !== 'OK') {
      console.error('❌ API Error:', response.data.error_message || response.data.status);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGooglePlacesAPI();