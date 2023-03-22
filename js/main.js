import * as L from '../vendors/leaflet/leaflet-src.esm.js';
import * as pannellum from '../vendors/pannellum/pannellum.js';

const PITCH = -15;
// In FurnaceTaken units
const MAX_DISTANCE = 500;
// Delta fucked up, east is north
const CORRECTION_OFFSET = -62;
const COMPASS_CORRECTION_OFFSET = CORRECTION_OFFSET * -1;


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
	
	fetch("../content/data.json")
		.then((response) => response.json())
		.then((json) => json.forEach(element => new L.Marker([element.y * factorY, element.x * factorX]).addTo(map).on('click', showPanoramaClick, this).options = element.id));
}

createMap();

var oMap = document.getElementById("map");
var oPanorama = document.getElementById("panorama");
var oControls = document.getElementById("controls");
//document.getElementsByClassName("leaflet-control-attribution")[0].style.display = "none"; // remove credits

//document.querySelector('#panorama .btn_fullscreen').addEventListener('click', toggleFullscreen);
document.querySelector('.btn_exit').addEventListener('click', exitPanorama);

async function fetchJSONData() {
    var response = await fetch("../content/data.json");
    var data = await response.json();
    return data;
}

function getViewInfo(viewID, data) {
    return data.filter(function(entry) {
        return entry.id == viewID;
    })[0];
}

function customHotspotClickFunction(event, handlerArgs) {
    event.preventDefault();
    document.getElementById("panorama").innerHTML = "";
    showPanorama(handlerArgs.id);
}

function initHotspots(viewInfo, data) {
    var hotspots = [];

    data.forEach(element => {
        if(element.id == viewInfo.id) {
            return
        }

        const dx = viewInfo.x - element.x;  // delta x (inches)
        const dy = viewInfo.y - element.y;  // delta y (inches)
        const distance = Math.sqrt(dx*dx + dy*dy); // dinstance in inches
        const yaw = -Math.atan2(dx, dy) * 180 / Math.PI;;  // pitch angle
        const pitch = Math.atan2(distance, dy) * 180 / Math.PI;  // yaw angle
        
        console.log(viewInfo.id + " -> " + element.id + ": "  +distance + "( " + yaw + "  )");


        const hotspotObject = new Object();
        hotspotObject.pitch = PITCH;
        hotspotObject.yaw = yaw + CORRECTION_OFFSET;
        hotspotObject.type = "scene";
        hotspotObject.text = element.id;
        hotspotObject.sceneId = element.id;
        hotspotObject.clickHandlerFunc = customHotspotClickFunction;
        hotspotObject.clickHandlerArgs = element;

        if(distance <= MAX_DISTANCE) {
            hotspots.push(hotspotObject);
        }

    });

    return hotspots;
}

function showPanoramaClick(e) {
    showPanorama(e.sourceTarget.options);
}


async function showPanorama(viewID) {
    var data = await fetchJSONData();
    var viewInfo = getViewInfo(viewID, data);
    var hotspots = initHotspots(viewInfo, data);

	window.pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": "content/views/"+viewID+".jpg",
        "autoLoad": true,
        "hotSpots": hotspots,
        "compass": true,
        "northOffset": COMPASS_CORRECTION_OFFSET
    })
	
	oMap.classList.add("hidden");
	oPanorama.classList.remove("hidden");
	oControls.classList.remove("hidden");
}
function exitPanorama() {
	oMap.classList.remove("hidden");
	oPanorama.classList.add("hidden");
	oControls.classList.add("hidden");
}