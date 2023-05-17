import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useLoader, useThree  } from '@react-three/fiber';
import * as THREE from 'three';
import "./Panorama.css";

const NAVIGATION_CLOSE = "/";

const TEXTURE_LINK_TEMPLATE = "https://panoramas.raidcore.gg/views/{id}.jpg"
const TEXTURE_LINK_PLACEHOLDER = "{id}";

const CAMERA_PERSPECTIVE_FOV = 75;
const CAMERA_PERSPECTIVE_NEAR = 0.01;
const CAMERA_PERSPECTIVE_FAR = 1100;
const CAMERA_PERSPECTIVE_POSITION = [0,0,0];

const PROJECTION_GEOMETRY_ARGS = [25, 20, 10];

function Sphere({id, cameraRef}) {
  // Reference to current mesh   
  const sphereRef = useRef();
  // Reference for camera
  const { camera } = useThree();

  // Texture loader
  const texture = useLoader(THREE.TextureLoader, TEXTURE_LINK_TEMPLATE.replace(TEXTURE_LINK_PLACEHOLDER, id));

  // Object state
  const [isUserInteracting, setUserInteracting] = useState(false);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);

  // Temporal object state
  const [onPointerDownLongitude, setOnPointerDownLongitude] = useState(0);
  const [onPointerDownLatitude, setOnPointerDownLatitude] = useState(0);
  const [onPointerDownMouseX, setOnPointerDownMouseX] = useState(0);
  const [onPointerDownMouseY, setOnPointerDownMouseY] = useState(0);


  function onPointerMove( event ) {
    console.log("onPointerMove")
    if ( event.isPrimary === false ) return;
    console.log("onPointerMove primary")
    // Calculate and set current longitude and latitude
    setLongitude(( onPointerDownMouseX - event.clientX ) * 0.1 + onPointerDownLongitude);
    setLatitude(( event.clientY - onPointerDownMouseY ) * 0.1 + onPointerDownLatitude);
  }

  function onPointerUp(event) {
    console.log("onPointerUp")
    if ( event.isPrimary === false ) return;
    console.log("onPointerUp primary")
    // Set user interaction flag to false
    setUserInteracting(false);
    // Remove temporary event listeners
    document.removeEventListener( 'pointermove', onPointerMove );
    document.removeEventListener( 'pointerup', onPointerUp );
  }


  function onPointerDown(event) {
    console.log("onPointerDown")
    if ( event.isPrimary === false ) return;
    console.log("onPointerDown primary")
    // Set user interaction flag to true
    setUserInteracting(true);
    // Set mouse locations for drag event
    setOnPointerDownMouseX(event.clientX);
    setOnPointerDownMouseY(event.clientY);
    // Set temporal longitude and latitude values from current values
    setOnPointerDownLongitude(longitude);
    setOnPointerDownLatitude(latitude);
    // Add temporary event listeners
    document.addEventListener( 'pointermove', onPointerMove );
    document.addEventListener( 'pointerup', onPointerUp );
  }

  // Init function
  useEffect(() => {
      document.addEventListener("pointerdown", onPointerDown);
    return () => {
      // Destructor
      document.removeEventListener( 'pointermove', onPointerMove );
      document.removeEventListener( 'pointerup', onPointerUp );
    };
  }, [])


  // Update on latitude and longitude changes
  useEffect(() => {
    setLatitude(Math.max( - 85, Math.min( 85, latitude )));
    const phi = THREE.MathUtils.degToRad( 90 - latitude );
    const theta = THREE.MathUtils.degToRad( longitude );

    const x = 500 * Math.sin( phi ) * Math.cos( theta );
    const y = 500 * Math.cos( phi );
    const z = 500 * Math.sin( phi ) * Math.sin( theta );

    console.log(`camera update: ${x}, ${y}, ${z}`);

    camera.lookAt(x, y, z);
  }, [latitude, longitude]);

  return (
    <mesh 
      ref={sphereRef}
      >
      <sphereGeometry args={PROJECTION_GEOMETRY_ARGS} />
      <meshBasicMaterial attach="material" map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene({id}) {
  // Reference to current camera
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