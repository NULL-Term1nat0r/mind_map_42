import React, { useState, useRef, useEffect } from "react";
import Terminal from "./terminal/terminal"; // Import Terminal component
import "./console.css";

function Console({ onClose }) {
  const consoleRef = useRef(null);
  const isResizing = useRef(false);
  const [height, setHeight] = useState(200);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const windowHeight = window.innerHeight;
    const newHeight = windowHeight - e.clientY;
    if (newHeight >= 100 && newHeight <= 600) {
      setHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div ref={consoleRef} className="console" style={{ height: `${height}px` }}>
      <div className="resize-handle-north" onMouseDown={handleMouseDown} />
      <div className="console-handle">
        Console
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="console-content">
        <Terminal /> {/* Terminal component inside console */}
      </div>
    </div>
  );
}

export default Console;
