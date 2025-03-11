import React from "react";
import "./header.css";

function Header({ onOpenSidebar, onOpenConsole, onOpenMainArea,  onOpenToolBar}) {
    return (
      <div className="header">
        <span>My Mind Map App</span>
        <div>
          <button onClick={onOpenSidebar}>Open Sidebar</button>
          <button onClick={onOpenConsole}>Open Console</button>
          <button onClick={onOpenMainArea}>Open Main Area</button>
          <button onClick={onOpenToolBar}>Open Toolbar</button>
        </div>
      </div>
    );
  }
  
  export default Header;