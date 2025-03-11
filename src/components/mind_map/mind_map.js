import { useRef, useEffect, useState } from "react";
import { Resizable } from "react-resizable";
import Draggable from "react-draggable";
import EventBus from "../../event_bus/event_bus"; // adjust path as needed
import "react-resizable/css/styles.css";
import "./mind_map.css";

function MindMapWindow() {
  const canvasRef = useRef(null);
  const draggableRef = useRef(null);
  const [windowSize, setWindowSize] = useState({ width: 500, height: 500 });
  const [isOpen, setIsOpen] = useState(true);
  const [circles, setCircles] = useState([]);
  const [connections, setConnections] = useState([]); // Track connections between circles
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [isDraggingCircle, setIsDraggingCircle] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [initialPanOffset, setInitialPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1); // Track the zoom level

  const panningSpeed = 1;

  // Function to draw a circle
  const drawCircle = (ctx, { x, y, radius }, isSelected = false) => {
    ctx.fillStyle = isSelected ? "rgba(255, 0, 0, 0.8)" : "rgba(255, 0, 0, 0.7)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw the circle at its original position
    ctx.fill();
  };

  // Function to draw a line between two circles
  const drawLine = (ctx, circle1, circle2) => {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(circle1.x, circle1.y);
    ctx.lineTo(circle2.x, circle2.y);
    ctx.stroke();
  };

  // Function to redraw all circles and lines
  const redrawCanvas = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y); // Apply pan offset
    ctx.scale(zoomLevel, zoomLevel); // Apply zoom level

    // Draw lines between connected circles
    connections.forEach(([index1, index2]) => {
      const circle1 = circles[index1];
      const circle2 = circles[index2];
      if (circle1 && circle2) {
        drawLine(ctx, circle1, circle2);
      }
    });

    // Draw circles
    circles.forEach((circle, index) => {
      drawCircle(ctx, circle, index === selectedCircle);
    });

    ctx.restore();
  };

  // Handle drawing new circles
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const handleDrawCircle = (data) => {
      setCircles((prevCircles) => [...prevCircles, data]); // Add new circle to state
    };

    EventBus.subscribe("drawCircle", handleDrawCircle);

    return () => {
      EventBus.unsubscribe("drawCircle", handleDrawCircle);
    };
  }, [isOpen]);

  // Handle connecting circles
  useEffect(() => {
    if (!isOpen) return;

    const handleConnectCircles = (data) => {
      const { index1, index2 } = data;
      setConnections((prevConnections) => [...prevConnections, [index1, index2]]);
    };

    EventBus.subscribe("connectCircles", handleConnectCircles);

    return () => {
      EventBus.unsubscribe("connectCircles", handleConnectCircles);
    };
  }, [isOpen]); // Add this useEffect for connecting circles

  // Redraw canvas when windowSize, circles, connections, selectedCircle, panOffset, or zoomLevel changes
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    redrawCanvas(ctx);
  }, [windowSize, circles, connections, selectedCircle, panOffset, zoomLevel, isOpen]);

  // Handle mouse down to select a circle or start panning
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel; // Adjust for zoom and pan
    const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel; // Adjust for zoom and pan

    // Check if the mouse is inside any circle
    const clickedCircleIndex = circles.findIndex(
      (circle) =>
        Math.sqrt((mouseX - circle.x) ** 2 + (mouseY - circle.y) ** 2) <= circle.radius
    );

    if (clickedCircleIndex !== -1) {
      setSelectedCircle(clickedCircleIndex); // Select the circle
      setIsDraggingCircle(true); // Start dragging the circle
    } else {
      setIsPanning(true); // Start panning
      setInitialMousePosition({ x: e.clientX, y: e.clientY }); // Record the initial mouse position
      setInitialPanOffset({ x: panOffset.x, y: panOffset.y }); // Record the initial pan offset
    }
  };

  // Handle mouse move to drag the selected circle or pan the canvas
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (isDraggingCircle && selectedCircle !== null) {
      // Drag the selected circle
      const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel; // Adjust for zoom and pan
      const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel; // Adjust for zoom and pan

      setCircles((prevCircles) =>
        prevCircles.map((circle, index) =>
          index === selectedCircle ? { ...circle, x: mouseX, y: mouseY } : circle
        )
      );
    } else if (isPanning) {
      // Pan the canvas
      const deltaX = (e.clientX - initialMousePosition.x) * panningSpeed; // Calculate delta relative to initial position
      const deltaY = (e.clientY - initialMousePosition.y) * panningSpeed; // Calculate delta relative to initial position

      // Apply the delta to the initial pan offset
      setPanOffset({
        x: initialPanOffset.x + deltaX,
        y: initialPanOffset.y + deltaY,
      });
    }
  };

  // Handle mouse up to stop dragging or panning
  const handleMouseUp = () => {
    setIsDraggingCircle(false);
    setIsPanning(false);
  };

  // Handle wheel event to adjust zoom level
  const handleWheel = (e) => {
    e.preventDefault();

    const zoomFactor = 0.1;
    const newZoomLevel = e.deltaY < 0 ? zoomLevel + zoomFactor : zoomLevel - zoomFactor;

    // Limit the zoom level to a reasonable range
    if (newZoomLevel >= 0.1 && newZoomLevel <= 5) {
      // Adjust the pan offset to keep the content centered
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleFactor = newZoomLevel / zoomLevel;
      setPanOffset({
        x: mouseX - (mouseX - panOffset.x) * scaleFactor,
        y: mouseY - (mouseY - panOffset.y) * scaleFactor,
      });

      setZoomLevel(newZoomLevel);
    }
  };

  // Add event listeners for mouse move, mouse up, and wheel
  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [isDraggingCircle, isPanning, zoomLevel]);

  const handleResize = (event, { size }) => {
    setWindowSize({ width: size.width, height: size.height });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Draggable handle=".window-header" nodeRef={draggableRef}>
      <Resizable
        width={windowSize.width}
        height={windowSize.height}
        onResize={handleResize}
        resizeHandles={["se"]}
      >
        <div
          ref={draggableRef}
          className="window"
          style={{ width: windowSize.width + "px", height: windowSize.height + "px" }}
        >
          <div className="window-header">
            <span>Mind Map Window</span>
            <button className="close-button" onClick={handleClose}>
              ×
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={windowSize.width}
            height={windowSize.height}
            style={{ border: "1px solid black" }}
            onMouseDown={handleMouseDown}
          />
        </div>
      </Resizable>
    </Draggable>
  );
}

export default MindMapWindow;