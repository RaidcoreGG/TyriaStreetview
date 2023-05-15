import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
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

function Sphere({id}) {
  const texture = useLoader(THREE.TextureLoader, TEXTURE_LINK_TEMPLATE.replace(TEXTURE_LINK_PLACEHOLDER, id));
  const sphereRef = useRef();

  useFrame(() => {
    // Rotate the sphere if desired
    sphereRef.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={PROJECTION_GEOMETRY_ARGS} />
      <meshBasicMaterial attach="material" map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene({id}) {
  
  return (
    <>
      <perspectiveCamera
        fov={CAMERA_PERSPECTIVE_FOV}
        aspect={window.innerWidth / window.innerHeight}
        near={CAMERA_PERSPECTIVE_NEAR}
        far={CAMERA_PERSPECTIVE_FAR}
        position={CAMERA_PERSPECTIVE_POSITION}
      />
      <Sphere id={id} />
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
        <div class="info">Panorama {id}</div>
        <button class="close-button" onClick={close}></button>
        <Canvas>
          <Scene id={id}/>
        </Canvas>
    </div>
  );
}

export default Panorama;