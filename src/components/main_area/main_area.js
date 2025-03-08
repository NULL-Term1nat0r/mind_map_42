import React, { useState } from "react";
import MindMap from "../mind_map/mind_map";
import "./main_area.css";

function MainArea({ onClose }) {
    return (
      <div className="main-area">
        <div className="main-area-header">
          Main Area
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <MindMap />
        {/* Add more mind map canvases here */}
      </div>
    );
  }
  
  export default MainArea;