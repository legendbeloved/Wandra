import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Moment } from '../types';

// Fix for default marker icons in Leaflet with React using CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  moments: Moment[];
  className?: string;
  interactive?: boolean;
}

// Component to handle map centering and bounds
const MapController = ({ moments }: { moments: Moment[] }) => {
  const map = useMap();

  useEffect(() => {
    if (moments.length > 0) {
      const bounds = L.latLngBounds(moments.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [moments, map]);

  return null;
};

export const MapView = ({ moments, className = "h-full w-full", interactive = true }: MapViewProps) => {
  const center: [number, number] = moments.length > 0 
    ? [moments[moments.length - 1].lat, moments[moments.length - 1].lng]
    : [0, 0];

  const positions: [number, number][] = moments.map(m => [m.lat, m.lng]);

  return (
    <div className={className}>
      <MapContainer 
        center={center} 
        zoom={13} 
        className="h-full w-full"
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {positions.length > 1 && (
          <Polyline 
            positions={positions} 
            color="#0F7490" 
            weight={3} 
            opacity={0.6} 
            dashArray="5, 10"
          />
        )}
        {moments.map((moment) => (
          <Marker 
            key={moment.id} 
            position={[moment.lat, moment.lng]}
          />
        ))}
        <MapController moments={moments} />
      </MapContainer>
    </div>
  );
};
