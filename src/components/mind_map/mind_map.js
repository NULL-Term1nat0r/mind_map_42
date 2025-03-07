import React, { useRef, useEffect, useState } from 'react';
import './mind_map.css';
import MindMapService from '../mind_map_service/mind_map_service'; // Import the MindMapService

const MindMap = () => {
    const canvasRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false); // Track panning state
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Track pan offset
    const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 }); // Track initial pan position
    const [shapes, setShapes] = useState([]); // Store all shapes
    const [isDragging, setIsDragging] = useState(false); // Track if the user is dragging (panning)
    const [scale, setScale] = useState(1); // Track zoom scale
    const [isHoveringShape, setIsHoveringShape] = useState(false); // Track if hovering over a shape
    const [hoveredCircle, setHoveredCircle] = useState(null); // Track the circle being hovered over

    // Function to draw all shapes
    const drawShapes = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas

        // Save the current canvas state
        ctx.save();

        // Apply pan and zoom transformations
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(scale, scale);

        // Draw each shape
        shapes.forEach((shape) => {
            ctx.beginPath();
            if (shape.type === 'circle') {
                ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2); // Draw the circle
                ctx.fillStyle = shape.color; // Set the fill color
                ctx.fill(); // Fill the circle
            } else if (shape.type === 'square') {
                ctx.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size); // Draw the square
                ctx.fillStyle = shape.color; // Set the fill color
                ctx.fill(); // Fill the square
            } else if (shape.type === 'triangle') {
                ctx.moveTo(shape.x, shape.y - shape.size / 2);
                ctx.lineTo(shape.x - shape.size / 2, shape.y + shape.size / 2);
                ctx.lineTo(shape.x + shape.size / 2, shape.y + shape.size / 2);
                ctx.closePath(); // Draw the triangle
                ctx.fillStyle = shape.color; // Set the fill color
                ctx.fill(); // Fill the triangle
            } else if (shape.type === 'line') {
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2); // Draw the line
                ctx.strokeStyle = shape.color; // Set the stroke color
                ctx.lineWidth = 2; // Set the line width
                ctx.stroke(); // Stroke the line
            }
            ctx.closePath();
        });

        // Restore the canvas state
        ctx.restore();
    };

    // Function to check if a point is inside a shape
    const isPointInShape = (x, y, shape) => {
        if (shape.type === 'circle') {
            const dx = x - shape.x;
            const dy = y - shape.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= shape.radius; // Check if inside the circle
        }
        return false;
    };

    // Function to calculate the intersection point between a line and a circle's border
    const getCircleBorderIntersection = (circle, mouseX, mouseY) => {
        const dx = mouseX - circle.x;
        const dy = mouseY - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = circle.radius / distance;
        return {
            x: circle.x + dx * scale,
            y: circle.y + dy * scale,
        };
    };

    // Initialize the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Function to set canvas size and redraw
        const setCanvasSize = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth; // Match parent width
            canvas.height = parent.clientHeight; // Match parent height
            drawShapes(ctx); // Redraw shapes
        };

        // Initial setup
        setCanvasSize();

        // Handle window resizing
        window.addEventListener('resize', setCanvasSize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', setCanvasSize);
        };
    }, [shapes, panOffset, scale]);

    // Handle mouse events for panning, drawing, and line snapping
    useEffect(() => {
        const canvas = canvasRef.current;

        const getMousePosition = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left, // X coordinate relative to canvas
                y: e.clientY - rect.top, // Y coordinate relative to canvas
            };
        };

        const handleMouseDown = (e) => {
            if (e.button === 0) { // Left mouse button
                setIsPanning(true);
                const mousePos = getMousePosition(e);
                setStartPanPosition({
                    x: mousePos.x - panOffset.x,
                    y: mousePos.y - panOffset.y,
                });
                setIsDragging(false); // Reset dragging state

                const selectedShape = MindMapService.getSelectedShape();

                if (selectedShape === 'line') {
                    // Handle line drawing
                    const hoveredCircle = shapes.find((shape) =>
                        shape.type === 'circle' &&
                        isPointInShape(
                            (mousePos.x - panOffset.x) / scale,
                            (mousePos.y - panOffset.y) / scale,
                            shape
                        )
                    );

                    if (hoveredCircle) {
                        console.log('Hovered Circle:', hoveredCircle); // Debug log

                        if (!MindMapService.getLineStartCircle()) {
                            // Set the starting circle
                            MindMapService.setLineStartCircle(hoveredCircle);
                            console.log('Line Start Circle Set:', hoveredCircle); // Debug log
                        } else {
                            // Set the ending circle and draw the line
                            MindMapService.setLineEndCircle(hoveredCircle);
                            const startCircle = MindMapService.getLineStartCircle();
                            const endCircle = MindMapService.getLineEndCircle();

                            console.log('Line End Circle Set:', hoveredCircle); // Debug log

                            // Calculate intersection points with circle borders
                            const startPoint = getCircleBorderIntersection(
                                startCircle,
                                (mousePos.x - panOffset.x) / scale,
                                (mousePos.y - panOffset.y) / scale
                            );
                            const endPoint = getCircleBorderIntersection(
                                endCircle,
                                (mousePos.x - panOffset.x) / scale,
                                (mousePos.y - panOffset.y) / scale
                            );

                            console.log('Line Start Point:', startPoint); // Debug log
                            console.log('Line End Point:', endPoint); // Debug log

                            // Add the line to the shapes array
                            setShapes((prevShapes) => [
                                ...prevShapes,
                                {
                                    type: 'line',
                                    x1: startPoint.x,
                                    y1: startPoint.y,
                                    x2: endPoint.x,
                                    y2: endPoint.y,
                                    color: '#000000', // Default line color
                                },
                            ]);

                            console.log('Line Added to Shapes:', {
                                type: 'line',
                                x1: startPoint.x,
                                y1: startPoint.y,
                                x2: endPoint.x,
                                y2: endPoint.y,
                                color: '#000000',
                            }); // Debug log

                            // Reset line drawing state
                            MindMapService.resetLineDrawing();
                            console.log('Line Drawing State Reset'); // Debug log
                        }
                    }
                } else {
                    // Handle shape drawing
                    if (!isDragging) {
                        const newShape = {
                            type: selectedShape,
                            x: (mousePos.x - panOffset.x) / scale, // Adjust for pan offset and zoom
                            y: (mousePos.y - panOffset.y) / scale, // Adjust for pan offset and zoom
                            radius: MindMapService.getCircleRadius(), // Use radius from MindMapService
                            size: 40, // Default size for square/triangle
                            color: MindMapService.getCircleColor(), // Use color from MindMapService
                        };
                        setShapes((prevShapes) => [...prevShapes, newShape]);

                        console.log('Shape Added to Shapes:', newShape); // Debug log
                    }
                }
            }
        };

        const handleMouseMove = (e) => {
            const mousePos = getMousePosition(e);

            // Check if the mouse is over any circle
            const hoveredCircle = shapes.find((shape) =>
                shape.type === 'circle' &&
                isPointInShape(
                    (mousePos.x - panOffset.x) / scale,
                    (mousePos.y - panOffset.y) / scale,
                    shape
                )
            );

            // Update hovered circle
            setHoveredCircle(hoveredCircle);

            // Update cursor based on hover state
            if (hoveredCircle) {
                canvas.style.cursor = 'crosshair'; // Change to crosshair
                setIsHoveringShape(true);
            } else {
                canvas.style.cursor = 'default'; // Revert to default
                setIsHoveringShape(false);
            }

            if (isPanning) {
                const dx = mousePos.x - (startPanPosition.x + panOffset.x);
                const dy = mousePos.y - (startPanPosition.y + panOffset.y);
                const distance = Math.sqrt(dx * dx + dy * dy);

                // If the mouse is moved significantly, treat it as dragging (panning)
                if (distance > 5) { // Adjust the threshold as needed
                    setIsDragging(true);
                    const offsetX = mousePos.x - startPanPosition.x;
                    const offsetY = mousePos.y - startPanPosition.y;
                    setPanOffset({ x: offsetX, y: offsetY });
                }
            }
        };

        const handleMouseUp = () => {
            setIsPanning(false); // Stop panning
            setIsDragging(false); // Reset dragging state
        };

        // Add event listeners
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        // Cleanup
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isPanning, panOffset, startPanPosition, isDragging, scale, shapes]);

    // Handle mouse wheel events for zooming
    useEffect(() => {
        const canvas = canvasRef.current;

        const handleWheel = (e) => {
            e.preventDefault(); // Prevent page scrolling

            const mousePos = {
                x: e.clientX - canvas.getBoundingClientRect().left,
                y: e.clientY - canvas.getBoundingClientRect().top,
            };

            const zoomFactor = 0.1; // Adjust the zoom speed
            const newScale = e.deltaY < 0 ? scale * (1 + zoomFactor) : scale * (1 - zoomFactor);

            // Limit the zoom level (optional)
            const minScale = 0.1;
            const maxScale = 5;
            const clampedScale = Math.min(Math.max(newScale, minScale), maxScale);

            // Adjust the pan offset to zoom around the mouse position
            const zoomPointX = (mousePos.x - panOffset.x) / scale;
            const zoomPointY = (mousePos.y - panOffset.y) / scale;

            setPanOffset({
                x: mousePos.x - zoomPointX * clampedScale,
                y: mousePos.y - zoomPointY * clampedScale,
            });

            setScale(clampedScale);
        };

        // Add event listener
        canvas.addEventListener('wheel', handleWheel);

        // Cleanup
        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [scale, panOffset]);

    return (
        <canvas
            ref={canvasRef}
            className="mind-map-canvas"
        />
    );
};

export default MindMap;