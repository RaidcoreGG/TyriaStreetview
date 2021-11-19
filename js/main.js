import * as leaflet from '../vendors/leaflet/leaflet-src.esm.js';
import * as pannellum from '../vendors/pannellum/pannellum.js';

class Map {
    
    map;
    southwest;
    southeast;
    basebounds = new leaflet.LatLngBounds({ lat: 0, lng: 40500 }, { lat: -40500, lng: 0 });
	
    constructor(){
        this.map = new leaflet.Map('map',
        {
            minZoom: 3,
            maxZoom: 7,
            crs: leaflet.CRS.Simple,
            maxBoundsViscosity: 1
        });
		
        this.southwest = this.map.unproject([0,40500], this.map.getMaxZoom());
        this.northeast = this.map.unproject([40500,0], this.map.getMaxZoom());
        this.map.setMaxBounds(new leaflet.LatLngBounds(this.southwest, this.northeast));

        leaflet.tileLayer("https://tiles{s}.guildwars2.com/1/1/{z}/{x}/{y}.jpg",
        {
            minZoom: 3,
            maxZoom: 7,
            continuousWorld: true,
            subdomains: [1,2,3,4]
        }).addTo(this.map);

        this.map.fitBounds(this.basebounds);
		
		this.map.setZoom(3);
		this.map.setView([-115.85, 127.4]); // lion's plaza

        var marker = new leaflet.Marker([-123.38, 129.3]).addTo(this.map).on('click', showPanorama, this).options = "aerodrome";
        var marker = new leaflet.Marker([-120, 115]).addTo(this.map).on('click', showPanorama, this).options = "largos";
        var marker = new leaflet.Marker([-119.4, 28.19]).addTo(this.map).on('click', showPanorama, this).options = "verdant";
	}
}

const map = new Map();

var oMap = document.getElementById("map");
var oPanorama = document.getElementById("panorama");
document.getElementsByClassName("leaflet-control-attribution")[0].style.display = "none"; // remove credits

//document.querySelector('#panorama .btn_fullscreen').addEventListener('click', toggleFullscreen);
document.querySelector('#panorama .btn_exit').addEventListener('click', exitPanorama);

function showPanorama(e) {
	window.pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": "content/views/"+e.sourceTarget.options+".png",
            "autoLoad": true
        })
	
	oMap.classList.add("hidden");
	oPanorama.classList.remove("hidden");
}
function exitPanorama() {
	oMap.classList.remove("hidden");
	oPanorama.classList.add("hidden");
}