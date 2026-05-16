
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasGoogleKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

interface Location {
  lat: number;
  lng: number;
  label?: string;
  id?: string;
}

interface UnifiedMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Location[];
  onMapClick?: (pos: { lat: number; lng: number }) => void;
  className?: string;
  isDark?: boolean;
}

export function UnifiedMap({ 
  center, 
  zoom = 13, 
  markers = [], 
  onMapClick, 
  className = "w-full h-full",
  isDark
}: UnifiedMapProps) {
  const [useGoogle, setUseGoogle] = useState(hasGoogleKey);

  // If mapping fails or key is missing, we could trigger a fallback UI
  // But for now, we'll respect the "Primary: Google, Secondary: OSM" mandate
  
  if (useGoogle) {
    return (
      <div className={className}>
        <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
          <Map
            defaultCenter={center}
            defaultZoom={zoom}
            center={center}
            zoom={zoom}
            mapId={isDark ? "7d8a6e8e8e8e8e8e" : "bf5a6e8e8e8e8e8e"} // Example IDs
            onClick={(e) => onMapClick?.({ lat: e.detail.latLng?.lat || 0, lng: e.detail.latLng?.lng || 0 })}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            colorScheme={isDark ? 'DARK' : 'LIGHT'}
            disableDefaultUI={true}
          >
            {markers.map((m, i) => (
              <AdvancedMarker key={m.id || i} position={{ lat: m.lat, lng: m.lng }} title={m.label}>
                <Pin background="#005B5C" glyphColor="white" borderColor="white" />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
        {/* Fallback toggle if needed, or just let it fail gracefully */}
      </div>
    );
  }

  // Secondary: OpenStreetMap
  return (
    <div className={className}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        {markers.map((m, i) => (
          <Marker key={m.id || i} position={[m.lat, m.lng]} icon={DefaultIcon} />
        ))}
        {onMapClick && <MapEventsHandler onClick={onMapClick} />}
        <MapCenterHandler center={center} />
      </MapContainer>
    </div>
  );
}

function MapEventsHandler({ onClick }: { onClick: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function MapCenterHandler({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
}
