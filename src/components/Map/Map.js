import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap} from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from "leaflet";
import "./Map.css"


const TILE_URL = 'https://tiles.tinyarmy.org/1/1/{z}/{x}/{y}.jpg';
const TILE_SIZE = 256;
const ZOOM_MIN = 2;
const ZOOM_MAX = 7;
const ZOOM_INITIAL = 2;
const CENTER = [-241, 368];
const COORDS_MIN = [0,0];
const COORDS_MAX = [81920, 114688];
const BOUNDS_VISCOSITY = 1.0;

const icon = L.icon({
  iconUrl: process.env.PUBLIC_URL + "/images/marker-icon.png",
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5]
});


function unproject(map, location) {
  return map.unproject(location, map.getMaxZoom());
}

function MapController() {
  
  const map = useMap();
  const navigate = useNavigate();
  const bounds = L.latLngBounds(unproject(map, COORDS_MIN), unproject(map, COORDS_MAX)); 
  const factorX = bounds.getEast() / COORDS_MAX[0];
  const factorY = bounds.getSouth() / COORDS_MAX[1];

  function loadMarkers() {
    fetch("https://panoramas.raidcore.gg/data.json")
    .then((response) => response.json())
    .then((json) => json.forEach(element => {
        console.log("Loading " + element.id)
        const marker = new L.Marker([element.y * factorY, element.x * factorX], {icon: icon});
        marker.bindTooltip(element.id).addTo(map);
        marker.on('click', showPanoramaClick, this).options.id = element.id;
    }));

  }

  function showPanoramaClick(eventArgs) {
    const id = eventArgs.target.options.id;
    navigate("view/"+id);
  }

  useEffect(() => {
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);
    map.setView(CENTER, ZOOM_INITIAL)
    loadMarkers();
  });

  return (
    <TileLayer
      url={TILE_URL}
      tileSize={TILE_SIZE}
      maxBoundsViscosity={BOUNDS_VISCOSITY}
      noWrap={!0}
      bounds={bounds}
    />
  );
}


function Map() {



  return (
    <MapContainer
        style={{ height: "100vh", width: "100%", margin: 0}} 
        zoom={ZOOM_INITIAL}
        center={CENTER}
        crs={L.CRS.Simple}
        minZoom={ZOOM_MIN}
        maxZoom={ZOOM_MAX}
        attributionControl= {!1}>
      <MapController/>
    </MapContainer>
  );
}

export default Map;