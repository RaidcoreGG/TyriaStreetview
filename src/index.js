import React from 'react';
import ReactDOM from 'react-dom/client';
import Map from './components/Map'
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Map />
  </React.StrictMode>
);
