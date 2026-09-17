import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapContainer from "./components/MapContainer";
import Admin from "./components/Admin";

import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app" style={{ width: "100vw", height: "100vh" }}>
        <Routes>
          <Route path="/" element={<MapContainer />} />
          <Route path="/fight" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}