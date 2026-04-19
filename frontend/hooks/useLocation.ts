'use client';
import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  lat:     number;
  lng:     number;
  city?:   string;
  address?: string;
}

interface UseLocationReturn {
  location:   UserLocation | null;
  loading:    boolean;
  error:      string | null;
  getLocation: () => void;
}

const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });

        // Reverse geocode using Google Maps Geocoding API if key is available
        const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (key) {
          try {
            const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`);
            const data = await res.json() as { results?: { formatted_address?: string; address_components?: { long_name: string; types: string[] }[] }[] };
            if (data.results?.[0]) {
              const address = data.results[0].formatted_address || '';
              const cityComp = data.results[0].address_components?.find(
                (c) => c.types.includes('locality')
              );
              setLocation({ lat, lng, address, city: cityComp?.long_name });
            }
          } catch { /* ignore geocode errors */ }
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Could not get your location.');
        setLoading(false);
        // Fallback to Mumbai
        setLocation({ lat: 19.076, lng: 72.877, city: 'Mumbai' });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  return { location, loading, error, getLocation };
};

export default useLocation;
