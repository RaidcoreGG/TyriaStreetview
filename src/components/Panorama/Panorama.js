import React, {useEffect, useRef, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { Canvas, useLoader } from '@react-three/fiber';
import { Cone, OrbitControls } from '@react-three/drei'
import * as THREE from 'three';
import "./Panorama.css";

const NAVIGATION_CLOSE = "/";

const TEXTURE_LINK_TEMPLATE = "https://panoramas.raidcore.gg/views/{id}.jpg"
const TEXTURE_LINK_PLACEHOLDER = "{id}";

const CAMERA_PERSPECTIVE_FOV = 75;
const CAMERA_PERSPECTIVE_NEAR = 0.01;
const CAMERA_PERSPECTIVE_FAR = 1100;
const CAMERA_PERSPECTIVE_POSITION = [0,0,0];
const CAMERA_ROTATION_SPEED = 1.0;

const PROJECTION_GEOMETRY_ARGS = [500, 40, 60];
const DISTANCE_LIMIT = 500;
const DISTANCE_CAMERA_TO_ARROW = 5;

const ARROW_OFFSET = [0, -10, 0];
const ARROW_ARGS = [1, 4, 32]; // coneRadius, coneHeight, coneRadialSegments

function Sphere({id, cameraRef}) {
  // Texture loader
  const texture = useLoader(THREE.TextureLoader, TEXTURE_LINK_TEMPLATE.replace(TEXTURE_LINK_PLACEHOLDER, id));
  // Hook into navigate
  const navigate = useNavigate();  
  // Control arrows storage
  const [arrows, setArrows] = useState([]);
  // Data cache
  const [viewId, setViewId] = useState(id);
  const [dataCache, setDataCache] = useState();
  const [currentPanoramaCache, setCurrentPanoramaCache] = useState();

  // Load data (ineffective - add backend to limit metadata fetch calls or something)
  const loadData = async () => {
    const response = await fetch("https://panoramas.raidcore.gg/data.json");
    const jsonData = await response.json();
    setDataCache(jsonData);
  }

  function loadCurrentPanoramaMetadata() {
    // Skip if cache is not yet loaded
    if(!dataCache) return;
    const current = dataCache.find(element => element.id === id);
    setCurrentPanoramaCache(current);
  }

  function loadArrows() {
    let idToLoad = viewId;

    if(!dataCache) {
      console.debug("loading arrows: data not available");
      return;
    }

    if(!currentPanoramaCache) {
      console.debug("loading arrows: current panorama unknown");
      return;
    }

    if(!viewId) {

      console.debug("loading arrows: currentId unknown using fallback ");
      idToLoad = currentPanoramaCache.id;
    }



    // Get location of current panorama
    const current_location = new THREE.Vector3(currentPanoramaCache.x, 0, currentPanoramaCache.y);
    const offset_vector = new THREE.Vector3().fromArray(ARROW_OFFSET);

    console.log("loading arrows for: " + idToLoad);

    // Iterate over every cached element
    dataCache.forEach(element => {
      // Skip same ID
      if(element.id === idToLoad ) return;
      // Calculate element distance
      let element_location = new THREE.Vector3(element.x, 0, element.y);
      let distance = current_location.distanceTo(element_location);
      // Limit distance
      if(distance > DISTANCE_LIMIT) return;

      // Calculate direction
      const direction = new THREE.Vector3();
      direction.subVectors(element_location, current_location).normalize()

      // Calculate cone position
      const distanceToCamera = DISTANCE_CAMERA_TO_ARROW; // Adjust this value to control the proximity of the cone to point A
      const position = new THREE.Vector3().fromArray([0,0,0]);
      position.addScaledVector(direction, distanceToCamera);
      position.add(offset_vector);

      // Generate random color
      const randomColor = "#" + (Math.floor(Math.random() * 16777215).toString(16));

      const arrowObject = {
        position: position,
        id: element.id,
        direction: direction,
        color: randomColor
      };

      console.log(arrowObject);
    
      // Update arrows storage
      console.log("adding arrow " + arrows.length);
      setArrows((prevArrows) => [...prevArrows, arrowObject]);
    });

  }

  function onArrowClick(arrow) {
    console.log("changing...");
    setArrows([]);
    navigate(`/view/${arrow.id}`);
    setViewId(arrow.id);
  }

  // Recompute arrows 
  useEffect(() => {
    console.log("current panorama change");
    setArrows([]);
    loadArrows();
  }, [currentPanoramaCache])

  // Recompute
  useEffect(() => {
    // reload current metadata
    console.log("cache or viewid change");
    loadCurrentPanoramaMetadata();
  }, [dataCache, viewId]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <mesh>
      <sphereGeometry args={PROJECTION_GEOMETRY_ARGS} />
      <meshBasicMaterial attach="material" map={texture} side={THREE.DoubleSide} />
      <OrbitControls
        rotateSpeed={CAMERA_ROTATION_SPEED} />
      {arrows.map((arrow) => (
        <Cone
          args={ARROW_ARGS}
          key={arrow.id}
          position={arrow.position}
          material-color={arrow.color}
          onClick={onArrowClick.bind(null, arrow)}
          rotation={new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              arrow.direction.clone().normalize()
            )
          )}
        >
           <meshBasicMaterial attach="material" color={arrow.color} />
        </Cone>
      ))}
    </mesh>
  );
}

function Scene({id}) {
  const cameraRef = useRef();

  return (
    <>
      <perspectiveCamera
        ref={cameraRef}
        fov={CAMERA_PERSPECTIVE_FOV}
        aspect={window.innerWidth / window.innerHeight}
        near={CAMERA_PERSPECTIVE_NEAR}
        far={CAMERA_PERSPECTIVE_FAR}
        position={CAMERA_PERSPECTIVE_POSITION}
      />
      <Sphere id={id} cameraRef={cameraRef} />
    </>
  );
}


function Panorama(props) {

  const navigate = useNavigate();  
  const { id } = useParams();
  
  function close() {
    navigate(NAVIGATION_CLOSE);
  }

  return (
    <div id="panorama">
        <div className="info">Panorama {id}</div>
        <button className="close-button" onClick={close}></button>
        <Canvas>
          <Scene id={id}/>
        </Canvas>
    </div>
  );
}

export default Panorama;