import React, { useState } from "react"; // Import useState
import Header from "../header/header";
import Sidebar from "../sidebar/sidebar";
import Console from "../console/console";
import MainArea from "../main_area/main_area";
import ToolBar from "../tool_bar/tool_bar";
import core_layout from "./core_layout.css";

function CoreLayout() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isConsoleVisible, setIsConsoleVisible] = useState(true);
    const [isMainAreaVisible, setIsMainAreaVisible] = useState(true);
    const [isToolBarVisible, setIsToolBarVisible] = useState(true);
  
    return (
        <div className="layout">
      <Header
        onOpenSidebar={() => setIsSidebarVisible(true)}
        onOpenConsole={() => setIsConsoleVisible(true)}
        onOpenMainArea={() => setIsMainAreaVisible(true)}
        onOpenToolBar={() => setIsToolBarVisible(true)}
      />
      <div className="layout-content">
        {isSidebarVisible && <Sidebar onClose={() => setIsSidebarVisible(false)} />}
        {isMainAreaVisible && <MainArea onClose={() => setIsMainAreaVisible(false)} />}
        {isToolBarVisible && <ToolBar onClose={() => setIsToolBarVisible(false)} />}  
      </div>
      {isConsoleVisible && <Console onClose={() => setIsConsoleVisible(false)} />}
    </div>
    );
  }
  
  export default CoreLayout;