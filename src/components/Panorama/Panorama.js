import React, {createContext, useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { Canvas, useLoader } from '@react-three/fiber';
import { Cone, OrbitControls, Line} from '@react-three/drei'
import * as THREE from 'three';
import "./Panorama.css";


const DEBUG_ENABLED = false;
const NAVIGATION_CLOSE = "/";

const DATA_LINK_MAIN = "https://panoramas.raidcore.gg/data.json";
const DATA_LINK_ALT = "https://sognus.cz/guildwars2/data.json";

const DATA_LINK = DATA_LINK_MAIN; 
const TEXTURE_LINK_TEMPLATE = "https://panoramas.raidcore.gg/views/{id}.jpg"
const TEXTURE_LINK_PLACEHOLDER = "{id}";

const CAMERA_PERSPECTIVE_FOV = 75;
const CAMERA_PERSPECTIVE_NEAR = 0.01;
const CAMERA_PERSPECTIVE_FAR = 1100;
const CAMERA_PERSPECTIVE_POSITION = [0,0,0];
const CAMERA_ROTATION_SPEED = 0.75;

const ORBIT_CONTROLS_ZOOM_ENABLED = false;
const ORBIT_CONTROLS_PAN_ENABLED = false;
const ORBIT_CONTROLS_ZOOM_MIN = 0;
const ORBIT_CONTROLS_ZOOM_MAX = 0;

const PROJECTION_GEOMETRY_ARGS = [500, 60, 40];
const DISTANCE_LIMIT = 500;
const DISTANCE_CAMERA_TO_ARROW = 10;

const ARROW_OFFSET = [0, -10, 0];
const ARROW_ARGS = [2, 6, 32]; // coneRadius, coneHeight, coneRadialSegments

// React context
const TooltipContext = createContext();

function TooltipProvider({ children }) {
  const [hoveredArrow, setHoveredArrow] = useState(null);
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  return (
    <TooltipContext.Provider value={{ hoveredArrow, setHoveredArrow, pointerPosition, setPointerPosition }}>
      {children}
    </TooltipContext.Provider>
  );
}

function Tooltip({id}) {

  const tooltipRef = useRef();
  const { hoveredArrow, pointerPosition } = useContext(TooltipContext);

  useEffect(() => {
    tooltipRef.current.style.top = `${pointerPosition.y}px`;
    tooltipRef.current.style.left = `${pointerPosition.x}px`;
    tooltipRef.current.style.display = hoveredArrow ? "block" : "none";
  }, [hoveredArrow, pointerPosition]);

  return (
    <div 
      ref={tooltipRef}
      className="tooltip"
    >
      {hoveredArrow && (hoveredArrow.displayName || hoveredArrow.id)}
  </div>
  )

}

function Arrow({arrow, onArrowClick}) {

  const tooltipRef = useRef();
  const [hover, setHover] = useState(false);
  const { hoveredArrow, setHoveredArrow, pointerPosition, setPointerPosition } = useContext(TooltipContext);

  function onPointerEnter() {
    setHoveredArrow(arrow);
    setHover(true);
  }

  function onPointerLeave() {
    setHoveredArrow(null);
    setHover(false);
  }

  function onPointerMove(event) {
    if(!hover) return;
    setPointerPosition({x: event.pageX, y: event.pageY});
  }

  function internalOnArrowClick(arrow) {
    setHoveredArrow(null);
    setHover(false);
    onArrowClick(arrow);
  }

  return (
    <mesh>
      <Cone
        args={ARROW_ARGS}
        key={arrow.id}
        position={arrow.position}
        material-color={arrow.color}
        onClick={internalOnArrowClick.bind(null, arrow)}
        rotation={new THREE.Euler().setFromQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            arrow.direction.clone().normalize()
          )
        )}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      >
        <meshBasicMaterial attach="material" color={hover ? "red" : arrow.color} />
      </Cone>
    </mesh>
  )
}

function Sphere({id, setDisplayName}) {
  // Sphere mesh ref
  const sphereGeometryRef = useRef();
  // load texture
  const texture = useLoader(THREE.TextureLoader, TEXTURE_LINK_TEMPLATE.replace(TEXTURE_LINK_PLACEHOLDER, id));
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1; 
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
    const response = await fetch(DATA_LINK);
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
      return;
    }

    if(!currentPanoramaCache) {
      return;
    }

    if(!viewId) {
      idToLoad = currentPanoramaCache.id;
    }


    // Get location of current panorama
    const current_location = new THREE.Vector3(currentPanoramaCache.x, 0, currentPanoramaCache.y);
    const offset_vector = new THREE.Vector3().fromArray(ARROW_OFFSET);

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
      const position = new THREE.Vector3().fromArray(CAMERA_PERSPECTIVE_POSITION);
      position.addScaledVector(direction, distanceToCamera);
      position.add(offset_vector);

      // Generate random color
      const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

      const arrowObject = {
        position: position,
        id: element.id,
        direction: direction,
        color: randomColor,
        displayName: element.displayName
      };
    
      // Update arrows storage
      setArrows((prevArrows) => [...prevArrows, arrowObject]);
    });

  }

  function onArrowClick(arrow) {
    setArrows([]);
    navigate(`/view/${arrow.id}`);
    setViewId(arrow.id);
  }

  // Recompute
  useEffect(() => {
    setArrows([]);
    loadArrows();
    // Recompute rotation
    const rotation = currentPanoramaCache?.rotation ?? 0;
    sphereGeometryRef.current.rotation.set(0, THREE.MathUtils.degToRad(rotation), 0);
    // Recompute display name
    const displayName = currentPanoramaCache?.displayName ?? viewId;
    setDisplayName(displayName);
  }, [currentPanoramaCache])

  // Recompute
  useEffect(() => {
    // reload current metadata
    loadCurrentPanoramaMetadata();
  }, [dataCache, viewId]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <mesh ref={sphereGeometryRef}>
        <sphereGeometry args={PROJECTION_GEOMETRY_ARGS} />
        <meshBasicMaterial attach="material" map={texture} side={THREE.BackSide} toneMapped={false} />
      </mesh>
      {arrows.map((metadata) => (
        <Arrow key={metadata.id} arrow={metadata} onArrowClick={onArrowClick}/>
      ))}
      <OrbitControls
          rotateSpeed={CAMERA_ROTATION_SPEED}
          enablePan={ORBIT_CONTROLS_PAN_ENABLED}
          enableZoom={ORBIT_CONTROLS_ZOOM_ENABLED}
          minZoom={ORBIT_CONTROLS_ZOOM_MIN}
          maxZoom={ORBIT_CONTROLS_ZOOM_MAX} />
    </>
  );
}

function Scene({id, setDisplayName}) {
  return (
    <>
      <orthographicCamera
        fov={CAMERA_PERSPECTIVE_FOV}
        aspect={window.innerWidth / window.innerHeight}
        near={CAMERA_PERSPECTIVE_NEAR}
        far={CAMERA_PERSPECTIVE_FAR}
        position={CAMERA_PERSPECTIVE_POSITION}
      />
      {DEBUG_ENABLED && (
        <>
          {/* west */}
          <Line points={[[0, 0, 0], [-100, 0, 0]]} color="red" />
          {/* north */}
          <Line points={[[0, 0, 0], [0, 0, -100]]} color="blue" />
          {/* up */}
          <Line points={[[0, 0, 0], [0, 100, 0]]} color="green" />
        </>
      )}
      <Sphere id={id} setDisplayName={setDisplayName}/>
    </>
  );
}


function Panorama(props) {

  const navigate = useNavigate();  
  const { id } = useParams();
  const [displayName, setDisplayName] = useState(id);
  
  function close() {
    navigate(NAVIGATION_CLOSE);
  }

  return (
    <div id="panorama">
        <div className="info">Panorama: {displayName}</div>
        <button className="close-button" onClick={close}></button>
        <TooltipProvider>
          <Canvas>
            <Scene id={id} setDisplayName={setDisplayName}/>
          </Canvas>
          <Tooltip />
        </TooltipProvider>
    </div>
  );
}

export default Panorama;