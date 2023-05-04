import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "./Panorama.css"

function Panorama(props) {

  const navigate = useNavigate();  
  const { id } = useParams();
  
  function close() {
    navigate("/");
  }

  return (
    <div style={{margin: "10px"}}>
      <p style={{display: "inline-block", marginRight: "10px"}}>Panorama {id}</p>
      <button onClick={close}>Close</button>
    </div>
  );
}

export default Panorama;