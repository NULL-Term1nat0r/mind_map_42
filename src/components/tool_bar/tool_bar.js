import React, { useState } from 'react';
import './tool_bar.css'; // Add CSS for the toolbar
import MindMapService from '../mind_map_service/mind_map_service'; // Import the MindMapService

const Toolbar = () => {
    const [isVisible, setIsVisible] = useState(false); // Track toolbar visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown visibility
    const [isCirclePopupOpen, setIsCirclePopupOpen] = useState(false); // Track circle popup visibility
    const [circleRadius, setCircleRadius] = useState(20); // Default radius for circle
    const [circleColor, setCircleColor] = useState('#FF0000'); // Default color for circle

    const handleObjectClick = () => {
        setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility
    };

    const handleShapeSelect = (shape) => {
        MindMapService.setSelectedShape(shape); // Update selected shape in MindMapService
        setIsDropdownOpen(false); // Close the dropdown

        // Open the circle popup if the circle shape is selected
        if (shape === 'circle') {
            setIsCirclePopupOpen(true);
        } else {
            setIsCirclePopupOpen(false);
        }
    };

    const handleRadiusChange = (e) => {
        const radius = parseInt(e.target.value, 10);
        if (!isNaN(radius)) {
            setCircleRadius(radius);
            MindMapService.setCircleRadius(radius); // Update radius in MindMapService
        }
    };

    const handleColorChange = (e) => {
        const color = e.target.value;
        setCircleColor(color);
        MindMapService.setCircleColor(color); // Update color in MindMapService
    };

    return (
        <div
            className={`toolbar ${isVisible ? 'visible' : ''}`}
            onMouseEnter={() => setIsVisible(true)} // Show toolbar on hover
            onMouseLeave={() => setIsVisible(false)} // Hide toolbar when mouse leaves
        >
            <h3>Toolbar</h3>
            <div className="dropdown">
                <button onClick={handleObjectClick}>Object</button>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={() => handleShapeSelect('circle')}>
                            Circle {MindMapService.getSelectedShape() === 'circle' && '✔️'}
                        </button>
                        <button onClick={() => handleShapeSelect('square')}>
                            Square {MindMapService.getSelectedShape() === 'square' && '✔️'}
                        </button>
                        <button onClick={() => handleShapeSelect('triangle')}>
                            Triangle {MindMapService.getSelectedShape() === 'triangle' && '✔️'}
                        </button>
                        <button onClick={() => handleShapeSelect('line')}>
                            Line {MindMapService.getSelectedShape() === 'line' && '✔️'}
                        </button>
                    </div>
                )}
            </div>
            <button>Button 2</button>
            <button>Button 3</button>

            {/* Circle Popup */}
            {isCirclePopupOpen && (
                <div className="circle-popup">
                    <h4>Circle Properties</h4>
                    <label>
                        Radius:
                        <input
                            type="number"
                            value={circleRadius}
                            onChange={handleRadiusChange}
                            min="1"
                            max="100"
                        />
                    </label>
                    <label>
                        Color:
                        <input
                            type="color"
                            value={circleColor}
                            onChange={handleColorChange}
                        />
                    </label>
                    <button onClick={() => setIsCirclePopupOpen(false)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Toolbar;