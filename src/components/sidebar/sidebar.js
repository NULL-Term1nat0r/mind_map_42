// src/components/sidebar/Sidebar.js
import React from 'react';
import './sidebar.css';

const Sidebar = ({ buttons, onButtonClick }) => {
  // Create the sidebar container
  const sidebar = React.createElement(
    'div',
    { className: 'sidebar' },
    // Map over the buttons array to create button elements
    buttons.map((button, index) =>
      React.createElement(
        'button',
        {
          key: index,
          className: 'sidebar-button',
          onClick: () => onButtonClick(button),
        },
        button // Button text
      )
    )
  );

  return sidebar;
};

export default Sidebar;