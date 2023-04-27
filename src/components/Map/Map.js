import React from 'react';
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import "./Map.css"

const tileUrl = 'https://tiles.tinyarmy.org/1/1/{z}/{x}/{y}.jpg';
const tileSize = 256;
const minZoon = 2;
const maxZoom = 7;
const center = [-241, 368];


function showPanoramaClick(eventArgs) {
    console.log("Show panorama click: ", eventArgs.target.options.id);
}

function unproject(map, location) {
    return map.unproject(location, map.getMaxZoom());
}


function Markers() {
    const map = useMap();
    const bounds = L.latLngBounds(unproject(map, [0,0]), unproject(map, [81920, 114688]))

	const factorX = bounds.getEast() / 81920;
	const factorY = bounds.getSouth() / 114688;

    const icon = L.icon({
        iconUrl: process.env.PUBLIC_URL + "/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
     });

    fetch("https://panoramas.raidcore.gg/data.json")
    .then((response) => response.json())
    .then((json) => json.forEach(element => {
        const marker = new L.Marker([element.y * factorY, element.x * factorX], {icon: icon});
        marker.addTo(map);
        marker.on('click', showPanoramaClick, this).options.id = element.id;
    }));

    return null;
}


function MapBounds() {
    const map = useMap();
    const bounds = L.latLngBounds(unproject(map, [0,0]), unproject(map, [81920, 114688]));
    map.setMaxBounds(bounds);

    console.log(map);

	console.log("N: " + bounds.getNorth());
	console.log("E: " + bounds.getEast());
	console.log("S: " + bounds.getSouth());
	console.log("W: " + bounds.getWest());
	
	const factorX = bounds.getEast() / 81920;
	const factorY = bounds.getSouth() / 114688;
	
	console.log(factorX);
	console.log(factorY);

    return null;
  }

function Map() {
  return (
    <MapContainer
        style={{ height: "100vh", width: "100%", margin: 0}} 
        zoom={3}
        center={center}
        crs={L.CRS.Simple}
        minZoom={minZoon}
        maxZoom={maxZoom}
        attributionControl= {!1}>
      <MapBounds/>
      <Markers/>
      <TileLayer
        url={tileUrl}
        tileSize={tileSize}
        maxBoundsViscosity={1}
        noWrap={!0}
      />
    </MapContainer>
  );
}

export default Map;