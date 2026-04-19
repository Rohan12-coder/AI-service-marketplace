'use client';
import React, { useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from '@react-google-maps/api';
import { IProvider } from '@/types';
import { getAvatarUrl, formatPrice, getDistanceLabel } from '@/lib/utils';
import { Star, Clock, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';

// ── Dark luxury map style ─────────────────────────────────────────────────────
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',        stylers: [{ color: '#0A0A0F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0A0F' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi',             elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park',        elementType: 'geometry',         stylers: [{ color: '#12121A' }] },
  { featureType: 'poi.park',        elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'poi.park',        elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
  { featureType: 'road',            elementType: 'geometry.fill',    stylers: [{ color: '#1A1A26' }] },
  { featureType: 'road',            elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.arterial',   elementType: 'geometry',         stylers: [{ color: '#22223A' }] },
  { featureType: 'road.highway',    elementType: 'geometry',         stylers: [{ color: '#2A2A3A' }] },
  { featureType: 'road.highway',    elementType: 'geometry.stroke',  stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway',    elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit',         elementType: 'geometry',         stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water',           elementType: 'geometry',         stylers: [{ color: '#080810' }] },
  { featureType: 'water',           elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water',           elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

const LIBRARIES: ('places' | 'geometry')[] = ['places', 'geometry'];

interface MapViewProps {
  providers:     IProvider[];
  userLocation?: { lat: number; lng: number };
  center?:       { lat: number; lng: number };
  zoom?:         number;
  height?:       string;
  onProviderSelect?: (provider: IProvider | null) => void;
  selectedProviderId?: string;
}

const DEFAULT_CENTER = { lat: 19.076, lng: 72.877 }; // Mumbai

const MapView: React.FC<MapViewProps> = ({
  providers,
  userLocation,
  center,
  zoom = 13,
  height = '100%',
  onProviderSelect,
  selectedProviderId,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [activeProvider, setActiveProvider] = useState<IProvider | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.setOptions({ styles: DARK_MAP_STYLE });
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMarkerClick = (provider: IProvider) => {
    setActiveProvider(provider);
    onProviderSelect?.(provider);
    // Pan map to provider
    if (mapRef.current && provider.location?.lat && provider.location?.lng) {
      mapRef.current.panTo({ lat: provider.location.lat, lng: provider.location.lng });
    }
  };

  const handleInfoWindowClose = () => {
    setActiveProvider(null);
    onProviderSelect?.(null);
  };

  // ── Error / loading states ────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-[#0D0D18] rounded-2xl border border-[rgba(212,175,55,0.1)]"
        style={{ height }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.15)] flex items-center justify-center mb-4">
          <MapPin size={28} className="text-[#D4AF37]" />
        </div>
        <h3 className="font-playfair font-bold text-[#F5F5F5] text-lg mb-2">Map Not Configured</h3>
        <p className="text-[#9090A0] text-sm text-center max-w-xs px-4">
          Add <code className="text-[#D4AF37] bg-[rgba(212,175,55,0.08)] px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="text-[#D4AF37]">.env.local</code> to enable the live map.
        </p>
        <p className="text-[#55556A] text-xs mt-3">{providers.length} providers loaded</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-[#0D0D18] rounded-2xl border border-red-500/20" style={{ height }}>
        <p className="text-red-400 text-sm">Failed to load Google Maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-[#0D0D18] rounded-2xl" style={{ height }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(212,175,55,0.2)] border-t-[#D4AF37] animate-spin" />
          <p className="text-[#9090A0] text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  const mapCenter = center || userLocation || DEFAULT_CENTER;

  // Gold pin icon for providers
  const providerIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: '#D4AF37',
    fillOpacity: 1,
    strokeColor: '#F0D060',
    strokeWeight: 2,
  };

  const selectedIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 14,
    fillColor: '#F0D060',
    fillOpacity: 1,
    strokeColor: '#D4AF37',
    strokeWeight: 3,
  };

  // User location icon (blue dot)
  const userIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#3B82F6',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height, borderRadius: '16px' }}
      center={mapCenter}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles:           DARK_MAP_STYLE,
        disableDefaultUI: false,
        zoomControl:      true,
        mapTypeControl:   false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling:  'cooperative',
      }}
    >
      {/* User location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={userIcon}
          title="Your location"
          zIndex={100}
        />
      )}

      {/* Provider markers with clustering */}
      <MarkerClusterer
        options={{
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
          gridSize:  40,
          minimumClusterSize: 3,
          styles: [{
            url: '',
            height: 40,
            width: 40,
            textColor: '#0A0A0F',
            textSize: 12,
            backgroundPosition: '0 0',
          }],
        }}
      >
        {(clusterer) => (
          <>
            {providers
              .filter((p) => p.location?.lat && p.location?.lng)
              .map((provider) => (
                <Marker
                  key={provider._id}
                  position={{ lat: provider.location.lat, lng: provider.location.lng }}
                  icon={provider._id === selectedProviderId ? selectedIcon : providerIcon}
                  title={provider.businessName}
                  clusterer={clusterer}
                  onClick={() => handleMarkerClick(provider)}
                  animation={
                    provider._id === selectedProviderId
                      ? google.maps.Animation.BOUNCE
                      : undefined
                  }
                  zIndex={provider._id === selectedProviderId ? 50 : 10}
                />
              ))}
          </>
        )}
      </MarkerClusterer>

      {/* Info window for active provider */}
      {activeProvider && activeProvider.location?.lat && activeProvider.location?.lng && (
        <InfoWindow
          position={{
            lat: activeProvider.location.lat,
            lng: activeProvider.location.lng,
          }}
          onCloseClick={handleInfoWindowClose}
          options={{ pixelOffset: new google.maps.Size(0, -20) }}
        >
          {/* Custom InfoWindow content */}
          <div
            style={{
              background: '#1A1A26',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '12px',
              padding: '12px',
              minWidth: '220px',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img
                src={getAvatarUrl(activeProvider.coverImage, activeProvider.businessName)}
                alt={activeProvider.businessName}
                style={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover', border: '1.5px solid rgba(212,175,55,0.3)' }}
              />
              <div>
                <p style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                  {activeProvider.businessName}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#D4AF37' }}>
                  <span>★ {activeProvider.rating.average.toFixed(1)}</span>
                  <span style={{ color: '#55556A' }}>·</span>
                  <span style={{ color: '#9090A0' }}>{activeProvider.completedJobs} jobs</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', fontSize: '11px', color: '#9090A0' }}>
              {activeProvider.location.city && (
                <span>📍 {activeProvider.location.city}</span>
              )}
              {activeProvider.distance !== undefined && (
                <span>🗺 {getDistanceLabel(activeProvider.distance)}</span>
              )}
              <span>⏱ {activeProvider.responseTime}</span>
              <span style={{ color: '#F5F5F5', fontWeight: 600 }}>
                From ₹{activeProvider.pricing.min.toLocaleString('en-IN')}/{activeProvider.pricing.unit}
              </span>
            </div>

            <a
              href={`/services/${activeProvider._id}`}
              style={{
                display: 'block',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #D4AF37, #F0D060)',
                color: '#0A0A0F',
                fontWeight: 700,
                fontSize: '12px',
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              View Profile & Book
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapView;
