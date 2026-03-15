"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative w-4 h-4">
        <div class="absolute inset-0 bg-[${color}] rounded-full opacity-40"></div>
        <div class="absolute inset-0.5 bg-[${color}] rounded-full border-2 border-white"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [positions, map]);
  return null;
}

interface StaticMapProps {
  pathHistory: [number, number][];
  interactive?: boolean;
}

export default function StaticMap({ pathHistory, interactive = false }: StaticMapProps) {
  const startIcon = useRef(createCustomIcon("#F59E0B")); // Amber start
  const endIcon = useRef(createCustomIcon("#14B8A6")); // Teal end

  // Use the first point as center if available
  const centerPosition: [number, number] = pathHistory.length > 0 ? pathHistory[0] : [20, 0];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={centerPosition}
        zoom={13}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        attributionControl={false}
        className="w-full h-full bg-[#E8E2D9]"
      >
        {/* CartoDB Positron (Light) Base Map for Journal Reading Experience */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Path Polyline */}
        {pathHistory.length > 1 && (
          <Polyline positions={pathHistory} color="#14B8A6" weight={3} opacity={0.8} dashArray="5, 5" />
        )}

        {/* Start Marker */}
        {pathHistory.length > 0 && (
          <Marker position={pathHistory[0]} icon={startIcon.current} />
        )}

        {/* End Marker */}
        {pathHistory.length > 1 && (
          <Marker position={pathHistory[pathHistory.length - 1]} icon={endIcon.current} />
        )}

        <MapBounds positions={pathHistory} />
      </MapContainer>
    </div>
  );
}
