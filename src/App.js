import React, { useState } from "react"; // Import useState
import Header from "./components/header/header";
import Sidebar from "./components/sidebar/sidebar";
import Console from "./components/console/console";
import MainArea from "./components/main_area/main_area";
import ToolBar from "./components/tool_bar/tool_bar";
import "./App.css";

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [isMainAreaVisible, setIsMainAreaVisible] = useState(true);
  const [isToolBarVisible, setIsToolBarVisible] = useState(true);

  return (
    <div className="app">
      <Header
        onOpenSidebar={() => setIsSidebarVisible(true)}
        onOpenConsole={() => setIsConsoleVisible(true)}
        onOpenMainArea={() => setIsMainAreaVisible(true)}
        onOpenToolBar={() => setIsToolBarVisible(true)}
      />
      <div className="app-content">
        {isSidebarVisible && <Sidebar onClose={() => setIsSidebarVisible(false)} />}
        {isMainAreaVisible && <MainArea onClose={() => setIsMainAreaVisible(false)} />}
        {isToolBarVisible && <ToolBar onClose={() => setIsToolBarVisible(false)} />}  
      </div>
      {isConsoleVisible && <Console onClose={() => setIsConsoleVisible(false)} />}
    </div>
  );
}

export default App;