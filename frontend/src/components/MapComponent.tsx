import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Gorakhpur coordinates [longitude, latitude] for MapLibre
  const lng = 83.3732;
  const lat = 26.7606;
  const zoom = 12;

  useEffect(() => {
    // Initialize map only once
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'dark-matter': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            ],
            tileSize: 256,
            attribution: '&copy; CARTO, OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'dark-matter-layer',
            type: 'raster',
            source: 'dark-matter',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [lng, lat],
      zoom: zoom
    });

    // Add a marker for the Command Center
    new maplibregl.Marker({ color: '#3b82f6' }) // Blue marker
      .setLngLat([lng, lat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setText('Gorakhpur Disaster Command Center')
      )
      .addTo(map.current);

    // Add circular hazard zone when map loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      map.current.addSource('hazard-zone', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              properties: {}
            }
          ]
        }
      });

      map.current.addLayer({
        id: 'hazard-zone-layer',
        type: 'circle',
        source: 'hazard-zone',
        paint: {
          'circle-radius': 80, // Size of the hazard zone
          'circle-color': '#ef4444', // Red
          'circle-opacity': 0.2,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ef4444'
        }
      });
    });

  }, [lng, lat, zoom]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md border border-gray-800 relative bg-gray-900">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* Overlay UI for the dashboard */}
      <div className="absolute top-4 left-4 z-10 bg-gray-950/80 border border-gray-800 text-white px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md pointer-events-none">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Command Center
        </h2>
        <p className="text-xs text-gray-400 mt-1">Live MapLibre Telemetry Active</p>
      </div>
    </div>
  );
}
