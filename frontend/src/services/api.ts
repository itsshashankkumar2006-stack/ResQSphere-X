import axios from 'axios';

// Matches your FastAPI backend port
const API_URL = 'http://127.0.0.1:8000/api/v1';

export const api = {
  // SOS & Alerts
  getSOS: () => axios.get(`${API_URL}/sos`),
  triggerSOS: (lat: number, lng: number, message: string) => 
    axios.post(`${API_URL}/sos`, { lat, lng, message }),
  
  broadcastAlert: (disaster_id: number, severity_threshold: string) =>
    axios.post(`${API_URL}/alerts/broadcast`, { disaster_id, severity_threshold }),

  // AI Damage Assessment
  analyzeReport: (report_text: string) =>
    axios.post(`${API_URL}/ai/analyze-report`, { report_text }),

  // Route Planner
  optimizeRoute: (start_node: string, end_node: string, blocked_roads: string[]) =>
    axios.post(`${API_URL}/routes/optimize`, { start_node, end_node, blocked_roads }),

  // Shelter Manager
  allocateShelter: (displaced_people: number, shelter_id: string) =>
    axios.post(`${API_URL}/shelters/allocate`, { displaced_people, shelter_id }),

  // Energy Planner
  estimateEnergy: (shelter_occupancy: number, solar_resource_kwh: number) =>
    axios.post(`${API_URL}/energy/estimate`, { shelter_occupancy, solar_resource_kwh }),

  // Disaster Simulator
  runScenario: (scenario_type: string, variables_changed: any) =>
    axios.post(`${API_URL}/simulations/run`, { scenario_type, variables_changed })
};