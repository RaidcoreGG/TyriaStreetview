import React from "react";
import ReactDOM from "react-dom/client";
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Panorama from './components/Panorama';
import Map from "./components/Map";
import 'leaflet/dist/leaflet.css';

const ROUTE_MAP = "/";
const ROUTE_PANORAMA = "view/:id";

const router = createBrowserRouter([
  {
    path: ROUTE_MAP,
    element: <Map />,
  },
  {
    path: ROUTE_PANORAMA,
    element: <Panorama/>,
  }
]);

const root = ReactDOM.createRoot(document.getElementById("app"))
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);