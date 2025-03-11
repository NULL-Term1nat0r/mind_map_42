import React, { useState, useRef, useEffect } from "react";
import "./tool_bar.css";

function ToolBar({ onClose }) {
  const toolbarRef = useRef(null);
  const isResizing = useRef(false);
  const [width, setWidth] = useState(300);

  // Start resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Perform resizing
  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const windowWidth = window.innerWidth;
    const newWidth = windowWidth - e.clientX;
    if (newWidth >= 150 && newWidth <= 600) {
      setWidth(newWidth);
    }
  };

  // End resizing
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
    <div
      ref={toolbarRef}
      className="toolbar"
      style={{ width: `${width}px` }}
    >
      <div
        className="resize-handle-west"
        onMouseDown={handleMouseDown}
      />
      <div className="toolbar-handle">
        Toolbar
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="toolbar-content">
        <p>Toolbar Content</p>
      </div>
    </div>
  );
}

export default ToolBar;
