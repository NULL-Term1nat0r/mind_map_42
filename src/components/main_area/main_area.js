// main_area.js
import React, { useState } from "react";
import MindMap from "../mind_map/mind_map";
import "./main_area.css";

function MainArea({ onClose }) {
  const [mode, setMode] = useState("circle"); // Default mode is "circle"

  return (
    <div className="main-area">
      <div className="main-area-header">
        Main Area
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <MindMap mode={mode} onSetMode={setMode} />
    </div>
  );
}

export default MainArea;