import React, {useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'
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

const PROJECTION_GEOMETRY_ARGS = [25, 20, 10];

function Sphere({id, cameraRef}) {
  // Texture loader
  const texture = useLoader(THREE.TextureLoader, TEXTURE_LINK_TEMPLATE.replace(TEXTURE_LINK_PLACEHOLDER, id));

  return (
    <mesh>
      <sphereGeometry args={PROJECTION_GEOMETRY_ARGS} />
      <meshBasicMaterial attach="material" map={texture} side={THREE.DoubleSide} />
      <OrbitControls rotateSpeed={CAMERA_ROTATION_SPEED} />
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