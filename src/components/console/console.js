import React, { useRef, useState } from "react";
import { Resizable } from "react-resizable";
import Draggable from "react-draggable";
import "react-resizable/css/styles.css";
import "./console.css";

function Console({ onClose }) {
    const draggableRef = useRef(null);
  
    return (
      <Draggable handle=".console-handle" nodeRef={draggableRef}>
        <Resizable width={Infinity} height={200} resizeHandles={["n"]}>
          <div ref={draggableRef} className="console">
            <div className="console-handle">
              Console
              <button className="close-button" onClick={onClose}>
                ×
              </button>
            </div>
            <div className="console-content">
              {/* Add console content here */}
              <p>Console Content</p>
            </div>
          </div>
        </Resizable>
      </Draggable>
    );
  }
  
  export default Console;