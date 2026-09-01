import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  // Gorakhpur coordinates
  const position: [number, number] = [26.7606, 83.3732];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
      <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Gorakhpur Disaster Command Center
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;