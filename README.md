# ResQSphere-X: Autonomous Disaster Management & Response Command Center

> **Smart India Hackathon (SIH) Submission**  
> An enterprise-grade, real-time spatial decision support system engineered for disaster response authorities (NDRF, District Magistrates) to mitigate floods, manage evacuations, and optimize emergency resources.

---

## 🚀 Key Modules & Capabilities
1. **Secure Command Authentication:** Role-based access gate for authorized emergency commanders.
2. **Live Meteorological Telemetry:** Real-time integration monitoring precipitation rates, humidity, wind vectors, and automated environmental threat indexes.
3. **AI Field Intelligence:** Automated NLP parsing of raw field reports into high-priority actionable emergency rescue plans.
4. **Interactive Geospatial Map (MapLibre GL & CARTO):** Features dark-mode tactical vector tiles, active SOS distress pins, route polylines, and interactive circular hazard zones with live trapped-citizen and safety metrics.
5. **Dynamic Rescue Route Planner:** Graph-based path calculation capable of instantly rerouting around simulated blocked roads.
6. **Shelter Capacity & Energy Planner:** Real-time occupancy tracking with overflow alerts alongside solar/grid power deficit calculators.
7. **Disaster Simulator:** Live multi-scenario simulation modeling water level inundation against regional infrastructure.

---

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, MapLibre GL, Zustand
* **Backend:** Python, FastAPI, Uvicorn, Pydantic, HTTPX

---

## ⚙️ Quick Start Guide

### 1. Backend Setup
\`\`\`bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`

### 2. Frontend Setup
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
\`\`\`
Access the command center at `http://localhost:5173` using passcode `1234`.