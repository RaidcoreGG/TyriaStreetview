import * as L from '../vendors/leaflet/leaflet-src.esm.js';
import * as pannellum from '../vendors/pannellum/pannellum.js';

fetch("../content/data.json")
  .then((response) => response.json())
  .then((data) => console.log(data));

var map;
var factorX;
var factorY;

function unproject(t) {
    return map.unproject(t, map.getMaxZoom())
}

function createMap() {
    map = L.map("map", {
        minZoom: 2,
        maxZoom: 7,
        crs: L.CRS.Simple,
        attributionControl: !1
    }), L.control.attribution({
        prefix: 'Tiles by <a href="https://blog.thatshaman.com/" target="_blank">that_shaman</a>',
        position: "bottomleft"
    }).addTo(map);
    var e = new L.LatLngBounds(unproject([0, 0]), unproject([81920, 114688]));
	console.log("N: " + e.getNorth());
	console.log("E: " + e.getEast());
	console.log("S: " + e.getSouth());
	console.log("W: " + e.getWest());
	
	factorX = e.getEast() / 81920;
	factorY = e.getSouth() / 114688;
	
	console.log(factorX);
	console.log(factorY);
	
    map.setMaxBounds(e), map.setView([-241, 368], 3), map.addLayer(L.tileLayer("https://tiles.tinyarmy.org/1/1/{z}/{x}/{y}.jpg", {
        maxZoom: 7,
        noWrap: !0,
        tileSize: 256,
        bounds: e,
        maxBoundsViscosity: 1
    }))
	
	data.forEach(element => new L.Marker([element.y * factorY, element.x * factorX]).addTo(map).on('click', showPanorama, this).options = element.id);
}

createMap();

var oMap = document.getElementById("map");
var oPanorama = document.getElementById("panorama");
//document.getElementsByClassName("leaflet-control-attribution")[0].style.display = "none"; // remove credits

//document.querySelector('#panorama .btn_fullscreen').addEventListener('click', toggleFullscreen);
document.querySelector('#panorama .btn_exit').addEventListener('click', exitPanorama);

function showPanorama(e) {
	window.pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": "content/views/"+e.sourceTarget.options+".jpg",
            "autoLoad": true
        })
	
	oMap.classList.add("hidden");
	oPanorama.classList.remove("hidden");
}
function exitPanorama() {
	oMap.classList.remove("hidden");
	oPanorama.classList.add("hidden");
}