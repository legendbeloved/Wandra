"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GeoLocation } from "@/hooks/useGeolocation";

// Custom Amber Dot Marker
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative w-6 h-6">
        <div class="absolute inset-0 bg-[#F59E0B] rounded-full opacity-40 animate-ping"></div>
        <div class="absolute inset-1 bg-[#C4622D] rounded-full border-2 border-[#1E1C1A]"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function AutoCenter({
  position,
  shouldCenter,
}: {
  position: [number, number] | null;
  shouldCenter: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (position && shouldCenter) {
      map.flyTo(position, 15, { animate: true, duration: 1.5 });
    }
  }, [position, shouldCenter, map]);

  return null;
}

interface ActiveMapProps {
  currentLocation: GeoLocation | null;
  pathHistory: [number, number][];
  shouldCenter: boolean;
}

export default function ActiveMap({ currentLocation, pathHistory, shouldCenter }: ActiveMapProps) {
  const customIcon = useRef(createCustomIcon());
  
  // Default to a world view or standard center if no location yet
  const centerPosition: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : [20, 0];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={centerPosition}
        zoom={currentLocation ? 15 : 2}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full bg-[#0A1A20]"
      >
        {/* CartoDB Dark Matter Base Map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Path Polyline */}
        {pathHistory.length > 1 && (
          <Polyline positions={pathHistory} color="#14B8A6" weight={4} opacity={0.8} />
        )}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={customIcon.current} />
        )}

        {/* Auto-centering logic */}
        <AutoCenter
          position={currentLocation ? [currentLocation.lat, currentLocation.lng] : null}
          shouldCenter={shouldCenter}
        />
      </MapContainer>
    </div>
  );
}
