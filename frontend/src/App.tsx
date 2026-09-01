import { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useStore } from './store/useStore';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('NDRF Commander');
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  const { 
    sosAlerts, 
    aiInsight, 
    activeRoute, 
    shelterOccupancyStatus,
    energyPlan,
    simulationStatus,
    weatherData,
    triggerSOS, 
    runAIAnalysis, 
    broadcast, 
    calculateRoute, 
    allocateShelter,
    calculateEnergy,
    runScenario,
    fetchLiveWeather
  } = useStore();

  // Local UI State
  const [aiReport, setAiReport] = useState('');
  const [blockedRoad, setBlockedRoad] = useState('');
  const [shelterCapacity, setShelterCapacity] = useState('');
  const [energyOccupancy, setEnergyOccupancy] = useState<number>(100);
  const [solarKwh, setSolarKwh] = useState<number>(150);
  const [waterLevel, setWaterLevel] = useState<number>(0);

  // Map Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Gorakhpur coordinates [Lng, Lat for MapLibre]
  const gorakhpurLngLat: [number, number] = [83.3732, 26.7606];

  // Route node coordinates
  const routeCoordinates: Record<string, [number, number]> = {
    "Zone_A": [83.3732, 26.7606],
    "Intersection_1": [83.3950, 26.7720],
    "Shelter_1": [83.4150, 26.7900],
  };

  // Distinct circular operational zones with real-time metrics for click popups
  const operationalZones = [
    { 
      id: "zone-a", 
      name: "Zone A (Downtown Core)", 
      lngLat: [83.3732, 26.7606] as [number, number], 
      trapped: 145, 
      safety: "15%", 
      status: "DANGER", 
      color: "#ef4444" 
    },
    { 
      id: "zone-b", 
      name: "Zone B (Northern Bypass)", 
      lngLat: [83.3980, 26.7750] as [number, number], 
      trapped: 42, 
      safety: "58%", 
      status: "CAUTION", 
      color: "#eab308" 
    },
    { 
      id: "zone-c", 
      name: "Zone C (Safe Sector Base)", 
      lngLat: [83.4200, 26.7950] as [number, number], 
      trapped: 0, 
      safety: "98%", 
      status: "SAFE", 
      color: "#22c55e" 
    },
  ];

  // Fetch live weather telemetry on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveWeather();
    }
  }, [isAuthenticated, fetchLiveWeather]);

  // Initialize MapLibre Map on load when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!mapContainer.current) return;
    if (mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: gorakhpurLngLat,
      zoom: 12.5
    });

    map.on('load', () => {
      map.resize();

      const zoneGeoJSON = {
        type: 'FeatureCollection' as const,
        features: operationalZones.map(zone => ({
          type: 'Feature' as const,
          properties: {
            id: zone.id,
            name: zone.name,
            color: zone.color,
            trapped: zone.trapped,
            safety: zone.safety,
            status: zone.status
          },
          geometry: {
            type: 'Point' as const,
            coordinates: zone.lngLat
          }
        }))
      };

      map.addSource('operational-zones', {
        type: 'geojson',
        data: zoneGeoJSON as any
      });

      map.addLayer({
        id: 'zone-radius-glow',
        type: 'circle',
        source: 'operational-zones',
        paint: {
          'circle-radius': 60,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.25,
          'circle-blur': 0.8
        }
      });

      map.addLayer({
        id: 'zone-radius-core',
        type: 'circle',
        source: 'operational-zones',
        paint: {
          'circle-radius': 10,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.on('click', 'zone-radius-glow', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const coordinates = (e.features[0].geometry as any).coordinates.slice();

        const popupContent = `
          <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
            <div style="font-weight: 800; font-size: 13px; margin-bottom: 6px; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">
              🛡️ ${props.name}
            </div>
            <div style="font-size: 12px; margin-bottom: 3px;">Status: <b>${props.status}</b></div>
            <div style="font-size: 12px; margin-bottom: 3px;">👥 Trapped People: <b>${props.trapped}</b></div>
            <div style="font-size: 12px;">🛡️ Safety Percentage: <b>${props.safety}</b></div>
          </div>
        `;

        new maplibregl.Popup({ offset: 15 })
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map);
      });

      map.on('mouseenter', 'zone-radius-glow', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'zone-radius-glow', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapInstance.current = map;

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [isAuthenticated]);

  // Update SOS Markers & Route Line when state changes
  useEffect(() => {
    if (!isAuthenticated || !mapInstance.current) return;
    const map = mapInstance.current;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (sosAlerts && sosAlerts.length > 0) {
      sosAlerts.forEach(alert => {
        const marker = new maplibregl.Marker({ color: '#ef4444' })
          .setLngLat([alert.lng, alert.lat])
          .setPopup(new maplibregl.Popup().setHTML(`<div style="color:black; font-weight:bold;">🚨 ${alert.message || "Emergency SOS"}</div>`))
          .addTo(map);
        
        markersRef.current.push(marker);
      });
    }

    const coordinates = activeRoute 
      ? activeRoute.map(node => routeCoordinates[node]).filter(Boolean) as [number, number][]
      : [];

    const sourceId = 'route-source';
    const layerId = 'route-layer';

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      });
    } else if (coordinates.length > 0) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#3b82f6', 'line-width': 6, 'line-dasharray': [2, 2] }
      });
    }
  }, [sosAlerts, activeRoute, isAuthenticated]);

  // Handle Login Form Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234' || passcode === 'sih2026' || passcode === '') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid security passcode. Try "1234".');
    }
  };

  // IF NOT AUTHENTICATED: Show Secure Login Gate
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-950 text-white p-4">
        <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-blue-400 tracking-wider">ResQSphere-X</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Emergency Command Gatekeeper</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Command Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-950 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="NDRF Commander">NDRF Response Commander</option>
                <option value="District Magistrate">District Magistrate (Gorakhpur)</option>
                <option value="System Admin">System Tech Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Security Passcode</label>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter access PIN (e.g. 1234)"
                className="w-full p-3 rounded-lg bg-gray-950 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {loginError && (
              <div className="text-xs text-red-400 font-semibold bg-red-950/40 p-2 rounded border border-red-900/50">
                {loginError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg tracking-wide uppercase text-sm mt-2"
            >
              Initialize Command Center
            </button>
          </form>

          <div className="mt-6 text-center text-[10px] text-gray-500">
            Smart India Hackathon • National Disaster Management Authority Framework
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: Show Full Command Center Dashboard
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900 text-white">
      {/* Left Sidebar / Command Center */}
      <div className="w-1/3 h-full overflow-y-auto p-6 bg-gray-900 border-r border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-400">ResQSphere-X</h1>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs bg-red-950 text-red-400 border border-red-800 px-3 py-1 rounded hover:bg-red-900 transition font-semibold"
          >
            Lock Terminal
          </button>
        </div>

        {/* Global Emergency Actions */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => broadcast(1, 'SEVERE')}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded font-bold transition shadow-lg text-xs"
          >
            Broadcast Alerts
          </button>
          <button 
            onClick={() => triggerSOS(26.7606, 83.3732, "Citizen distress signal detected!")}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded font-bold transition shadow-lg animate-pulse text-xs"
          >
            Trigger SOS
          </button>
        </div>

        {/* MODULE: Live Meteorological Telemetry */}
        <div className="p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold text-sm">🌤️ Live Meteorological Feed</h3>
            <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full animate-pulse">LIVE SENSOR</span>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-md border border-gray-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Precipitation Rate:</span>
              <span className="text-cyan-400 font-bold">{weatherData ? `${weatherData.rainfall_mm_per_hr} mm/hr (Heavy)` : 'Loading...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Atmospheric Humidity:</span>
              <span className="text-blue-300 font-bold">{weatherData ? `${weatherData.humidity_percent}%` : 'Loading...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Wind Vector:</span>
              <span className="text-gray-200 font-bold">{weatherData ? `${weatherData.wind_speed_kmh} km/h (NE)` : 'Loading...'}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-800">
              <span className="text-gray-400">AI Environmental Threat:</span>
              <span className="text-red-400 font-bold">{weatherData?.flood_risk_index || 'ANALYZING'}</span>
            </div>
          </div>

          <button 
            onClick={() => {
              const rainVal = weatherData ? weatherData.rainfall_mm_per_hr : 85;
              setWaterLevel(rainVal);
              runScenario('flood', { water_level_cm: rainVal });
            }}
            className="w-full mt-3 bg-cyan-800 hover:bg-cyan-700 text-white font-bold py-1.5 px-3 rounded text-xs transition flex items-center justify-center gap-1.5 shadow"
          >
            ⚡ Sync Rainfall to Flood Simulator
          </button>
        </div>

        {/* MODULE 1: AI Field Intelligence */}
        <div className="p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-md">
          <h3 className="text-white font-bold mb-2 text-sm">🧠 AI Field Intelligence</h3>
          <textarea 
            value={aiReport}
            onChange={(e) => setAiReport(e.target.value)}
            placeholder="Paste raw field report here..."
            className="w-full p-2 mb-2 rounded bg-gray-900 text-white border border-gray-600 h-20 text-xs focus:outline-none focus:border-purple-500"
          />
          <button 
            onClick={() => runAIAnalysis(aiReport)}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-xs transition"
          >
            Analyze Report
          </button>
          {aiInsight && (
            <div className="mt-3 text-xs text-gray-300 bg-gray-900 p-3 rounded border border-purple-900/50">
              <p><strong>Severity:</strong> {aiInsight.severity || aiInsight.Priority}</p>
              <p><strong>Action:</strong> {aiInsight.action || aiInsight.Action_Plan}</p>
            </div>
          )}
        </div>

        {/* MODULE: Regional Zone Safety Matrix */}
        <div className="p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-md">
          <h3 className="text-white font-bold mb-3 text-sm">🛡️ Regional Zone Safety Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-red-950/40 border border-red-900/60 rounded-md">
              <div>
                <p className="font-bold text-red-400 text-xs">Zone A (Downtown Core)</p>
                <p className="text-[10px] text-gray-400">Trapped: 145 | Safety: 15%</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">DANGER</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-yellow-950/40 border border-yellow-900/60 rounded-md">
              <div>
                <p className="font-bold text-yellow-400 text-xs">Zone B (Northern Bypass)</p>
                <p className="text-[10px] text-gray-400">Trapped: 42 | Safety: 58%</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-600 text-white rounded">CAUTION</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-green-950/40 border border-green-900/60 rounded-md">
              <div>
                <p className="font-bold text-green-400 text-xs">Zone C (Safe Sector Base)</p>
                <p className="text-[10px] text-gray-400">Trapped: 0 | Safety: 98%</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded">SAFE</span>
            </div>
          </div>
        </div>

        {/* MODULE 2: Rescue Route Planner */}
        <div className="p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-md">
          <h3 className="text-white font-bold mb-2 text-sm">🗺️ Rescue Route Planner</h3>
          <input 
            type="text" 
            value={blockedRoad}
            onChange={(e) => setBlockedRoad(e.target.value)}
            placeholder="Simulate Blocked Road (e.g. Highway 1)"
            className="w-full p-2 mb-2 rounded bg-gray-900 text-white border border-gray-600 text-xs focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={() => calculateRoute('Zone_A', 'Shelter_1', blockedRoad ? [blockedRoad] : [])}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-xs transition"
          >
            Calculate Safe Route
          </button>
          {activeRoute && (
            <div className="mt-3 text-xs text-green-400 font-bold bg-gray-900 p-3 rounded border border-green-900/50">
              Active Path: {activeRoute.join(' ➔ ')}
            </div>
          )}
        </div>

        {/* MODULE 3: Shelter Capacity Allocation */}
        <div className="p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-md">
          <h3 className="text-white font-bold mb-2 text-sm">🏠 Shelter Capacity Allocation</h3>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={shelterCapacity}
              onChange={(e) => setShelterCapacity(e.target.value)}
              placeholder="People"
              className="w-2/3 p-2 rounded bg-gray-900 text-white border border-gray-600 text-xs focus:outline-none focus:border-green-500"
            />
            <button 
              onClick={() => allocateShelter(Number(shelterCapacity), '1')}
              className="w-1/3 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-2 rounded text-xs transition"
            >
              Allocate
            </button>
          </div>
          {shelterOccupancyStatus && (
            <div className={`mt-3 text-xs font-bold p-3 rounded border ${shelterOccupancyStatus.includes('❌') ? 'text-red-400 bg-red-900/20 border-red-900/50' : 'text-green-400 bg-green-900/20 border-green-900/50'}`}>
              {shelterOccupancyStatus}
            </div>
          )}
        </div>

        {/* MODULE 6: Energy Planner */}
        <div className="p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-md">
          <h3 className="text-white font-bold mb-2 text-sm">⚡ Energy Planner</h3>
          <div className="flex gap-2 mb-2">
            <input 
              type="number" 
              value={energyOccupancy} 
              onChange={(e) => setEnergyOccupancy(Number(e.target.value))} 
              placeholder="Occupancy"
              className="w-1/2 p-2 rounded bg-gray-900 text-white border border-gray-600 text-xs focus:outline-none focus:border-yellow-500"
            />
            <input 
              type="number" 
              value={solarKwh} 
              onChange={(e) => setSolarKwh(Number(e.target.value))} 
              placeholder="Solar kWh"
              className="w-1/2 p-2 rounded bg-gray-900 text-white border border-gray-600 text-xs focus:outline-none focus:border-yellow-500"
            />
          </div>
          <button 
            onClick={() => calculateEnergy(energyOccupancy, solarKwh)}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded text-xs transition"
          >
            Estimate Power Needs
          </button>
          {energyPlan && (
            <div className="mt-3 text-xs text-gray-300 bg-gray-900 p-3 rounded border border-yellow-900/50 space-y-1">
              <p>🔋 Coverage: <span className="font-bold text-white">{energyPlan.coverage_percent}%</span></p>
              <p>⚠️ Deficit: <span className="text-red-400">{energyPlan.deficit_kwh} kWh</span></p>
              <p>🔌 Generator Required: {energyPlan.generator_required ? 'YES 🚨' : 'NO ✅'}</p>
            </div>
          )}
        </div>

        {/* MODULE 7: Disaster Simulator */}
        <div className="p-4 bg-gray-800 rounded-lg mb-10 border border-gray-700 shadow-md">
          <h3 className="text-white font-bold mb-2 text-sm">🌊 Flood Simulator</h3>
          <input 
            type="number" 
            value={waterLevel} 
            onChange={(e) => setWaterLevel(Number(e.target.value))} 
            placeholder="Water Level (cm)"
            className="w-full p-2 mb-2 rounded bg-gray-900 text-white border border-gray-600 text-xs focus:outline-none focus:border-cyan-500"
          />
          <button 
            onClick={() => runScenario('flood', { water_level_cm: waterLevel })}
            className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded text-xs transition"
          >
            Run Simulation
          </button>
          {simulationStatus && (
            <div className="mt-3 text-xs text-gray-300 bg-gray-900 p-3 rounded border border-cyan-900/50">
              <p>{simulationStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Map Container */}
      <div className="w-2/3 h-full relative bg-gray-950">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}