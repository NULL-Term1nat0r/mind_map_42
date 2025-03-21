import React, { useState, useRef, useEffect } from "react";
import "./sidebar.css";

function Sidebar({ onClose }) {
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const [width, setWidth] = useState(300);

  // Mouse down on handle
  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Mouse move => resize
  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth >= 150 && newWidth <= 1200) {
      setWidth(newWidth);
    }
  };

  // Mouse up => stop resizing
  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className="sidebar"
      style={{ width: `${width}px` }}
    >
      <div className="sidebar-handle">
        Sidebar
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="sidebar-content">
        <p>Sidebar Content</p>
      </div>
      <div
        className="resize-handle"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}

export default Sidebar;
