/**
 * Reverse Geocoding Utility
 * Uses Nominatim (OpenStreetMap) API - Free Tier
 */

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Wandra-Travel-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();
    return {
      place_name: data.display_name,
      city: data.address.city || data.address.town || data.address.village || data.address.suburb,
      country: data.address.country,
    };
  } catch (error) {
    console.error('Geocoding Error:', error);
    return null;
  }
}
