import { useRef, useEffect, useState } from "react";
import { Resizable } from "react-resizable";
import Draggable from "react-draggable";
import "react-resizable/css/styles.css"; // Default styles for resizable
import "./mind_map.css"; // Custom styles for the window

function MindMapWindow() {
  const canvasRef = useRef(null);
  const draggableRef = useRef(null); // Ref for the Draggable container
  const [windowSize, setWindowSize] = useState({ width: 500, height: 500 });
  const [isOpen, setIsOpen] = useState(true); // Control window visibility

  // Handle canvas drawing
  useEffect(() => {
    if (!isOpen) return; // Don't draw if the window is closed

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    // Draw a red circle
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(windowSize.width / 2, windowSize.height / 2, 100, 0, Math.PI * 2);
    ctx.fill();
  }, [windowSize, isOpen]);

  // Handle window resize
  const handleResize = (event, { size }) => {
    setWindowSize({ width: size.width, height: size.height });
  };

  // Close the window
  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null; // Don't render the window if it's closed

  return (
    <Draggable handle=".window-header" nodeRef={draggableRef}>
      <Resizable
        width={windowSize.width}
        height={windowSize.height}
        onResize={handleResize}
        resizeHandles={["se"]} // Allow resizing from the bottom-right corner
      >
        <div
          ref={draggableRef} // Attach the ref to the draggable container
          className="window"
          style={{ width: windowSize.width + "px", height: windowSize.height + "px" }}
        >
          {/* Window Header (Tab) */}
          <div className="window-header">
            <span>Mind Map Window</span>
            <button className="close-button" onClick={handleClose}>
              ×
            </button>
          </div>

          {/* Canvas */}
          <canvas ref={canvasRef} className="mind-map-canvas" />
        </div>
      </Resizable>
    </Draggable>
  );
}

export default MindMapWindow;