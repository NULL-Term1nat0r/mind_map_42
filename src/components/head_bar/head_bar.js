// src/components/header/Header.js
import React from 'react';
import './head_bar.css'; // We'll create this next

const Header = ({ title }) => {
  return React.createElement(
    'header',
    { className: 'header' },
    React.createElement('h1', null, title)
  );
};

export default Header;