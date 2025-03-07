import React, { useState } from 'react';
import Sidebar from './components/sidebar/sidebar';
import Header from './components/head_bar/head_bar'; // Import the Header component
import MindMap from './components/mind_map/mind_map'; // Import the MindMap component
import Toolbar from './components/tool_bar/tool_bar'; // Import the Toolbar component
import './App.css';

function App() {
    const [activeButton, setActiveButton] = useState('Home');
    const buttons = ['Home', 'About', 'Contact', 'Settings'];

    const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
        console.log(`${buttonName} button clicked!`);
    };

    return (
        <div className="app-container">
            {/* Header component */}
            <Header title="My React App" />

            {/* Sidebar and main content */}
            <div className="content-container">
                <Sidebar buttons={buttons} onButtonClick={handleButtonClick} />
                <div className="main-content">
                    <MindMap /> {/* Use the MindMap component */}
                    <Toolbar /> {/* Use the Toolbar component */}
                </div>
            </div>
        </div>
    );
}

export default App;