import React, { useRef, useState } from "react";
import { Resizable } from "react-resizable";
import Draggable from "react-draggable";
import "react-resizable/css/styles.css";
import "./sidebar.css";

function Sidebar({ onClose }) {
    const draggableRef = useRef(null);
    const [width, setWidth] = useState(300); // Track width state

    const handleResize = (event, { size }) => {
        setWidth(size.width); // Update width dynamically
    };

    return (
        <Draggable handle=".sidebar-handle" nodeRef={draggableRef}>
            <Resizable
                width={width}
                height={Infinity}
                resizeHandles={["e"]} // Resize only from the right
                handle={<div className="custom-resize-handle" />}
                onResize={handleResize} // Handle resizing
            >
                <div ref={draggableRef} className="sidebar" style={{ width }}>
                    <div className="sidebar-handle">
                        Sidebar
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>
                    <div className="sidebar-content">
                        <p>Sidebar Content</p>
                    </div>
                    {/* Attach custom resize handle */}
                    <div className="custom-resize-handle" />
                </div>
            </Resizable>
        </Draggable>
    );
}

export default Sidebar;
