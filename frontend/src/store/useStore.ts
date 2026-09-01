import { create } from 'zustand';

interface SOSAlert {
  id: string;
  lat: number;
  lng: number;
  message: string;
}

interface StoreState {
  sosAlerts: SOSAlert[];
  aiInsight: any;
  activeRoute: string[] | null;
  shelterOccupancyStatus: string | null;
  energyPlan: any;
  simulationStatus: string | null;
  weatherData: any;
  
  triggerSOS: (lat: number, lng: number, message: string) => void;
  runAIAnalysis: (report: string) => Promise<void>;
  broadcast: (zoneId: number, severity: string) => Promise<void>;
  calculateRoute: (start: string, destination: string, blockedEdges?: string[]) => Promise<void>;
  allocateShelter: (peopleCount: number, shelterId: string) => Promise<void>;
  calculateEnergy: (occupancy: number, solarKwh: number) => Promise<void>;
  runScenario: (scenarioType: string, parameters: any) => Promise<void>;
  fetchLiveWeather: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  sosAlerts: [],
  aiInsight: null,
  activeRoute: null,
  shelterOccupancyStatus: null,
  energyPlan: null,
  simulationStatus: null,
  weatherData: null,

  triggerSOS: (lat, lng, message) => {
    set((state) => ({
      sosAlerts: [...state.sosAlerts, { id: Math.random().toString(), lat, lng, message }]
    }));
  },

  runAIAnalysis: async (report) => {
    try {
      const res = await fetch('http://localhost:8000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report })
      });
      const data = await res.json();
      set({ aiInsight: data });
    } catch (err) {
      console.error("AI Analysis failed", err);
    }
  },

  broadcast: async (zoneId, severity) => {
    try {
      const res = await fetch(`http://localhost:8000/api/broadcast?zone_id=${zoneId}&severity=${severity}`, {
        method: 'POST'
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error("Broadcast failed", err);
    }
  },

  calculateRoute: async (start, destination, blockedEdges = []) => {
    try {
      const res = await fetch('http://localhost:8000/api/routes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, destination, blocked_edges: blockedEdges })
      });
      const data = await res.json();
      set({ activeRoute: data.optimal_route });
    } catch (err) {
      console.error("Route calculation failed", err);
    }
  },

  allocateShelter: async (peopleCount, shelterId) => {
    try {
      const res = await fetch('http://localhost:8000/api/shelters/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people_count: peopleCount, shelter_id: shelterId })
      });
      const data = await res.json();
      set({ shelterOccupancyStatus: data.status });
    } catch (err) {
      console.error("Shelter allocation failed", err);
    }
  },

  calculateEnergy: async (occupancy, solarKwh) => {
    try {
      const res = await fetch('http://localhost:8000/api/energy/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupancy, solar_kwh: solarKwh })
      });
      const data = await res.json();
      set({ energyPlan: data });
    } catch (err) {
      console.error("Energy planning failed", err);
    }
  },

  runScenario: async (scenarioType, parameters) => {
    try {
      const res = await fetch('http://localhost:8000/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_type: scenarioType, parameters })
      });
      const data = await res.json();
      set({ simulationStatus: data.simulation_result });
    } catch (err) {
      console.error("Simulation failed", err);
    }
  },

  fetchLiveWeather: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/weather/live');
      const data = await res.json();
      set({ weatherData: data });
    } catch (err) {
      console.error("Failed to fetch live weather telemetry", err);
    }
  }
}));