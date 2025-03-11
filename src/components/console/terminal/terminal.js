import React, { useState, useRef, useEffect } from "react";
import EventBus from "../../../event_bus/event_bus"; // adjust path as needed
import "./terminal.css";

function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const outputRef = useRef(null); // Ref for the output container

  // Focus the input field when the terminal is clicked
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Handle command input
  const handleCommand = () => {
    if (!input.trim()) return;
  
    let output = "";
  
    if (input === "help") {
      output = "Available commands: help, clear, echo [text], draw circle [x] [y] [radius], connect [index1] [index2]";
    } else if (input.startsWith("echo ")) {
      output = input.slice(5);
    } else if (input === "clear") {
      setHistory([]);
      setInput("");
      return;
    } else if (input.startsWith("draw circle")) {
      // Trim the input and split by one or more spaces
      const parts = input.trim().split(/\s+/).slice(2); // Get everything after "draw circle"
      
      // Ensure we have the correct number of parameters
      if (parts.length === 3) {
        const [x, y, radius] = parts.map(Number);
        if (!isNaN(x) && !isNaN(y) && !isNaN(radius)) {
          EventBus.emit("drawCircle", { x, y, radius });
          output = `Drawing circle at (${x}, ${y}) with radius ${radius}...`;
        } else {
          output = "Invalid parameters. Please provide valid numbers for x, y, and radius.";
        }
      } else {
        output = "Invalid command format. Use: draw circle [x] [y] [radius]";
      }
    } else if (input.startsWith("connect ")) {
      const parts = input.trim().split(/\s+/).slice(1); // Get everything after "connect"
      if (parts.length === 2) {
        const [index1, index2] = parts.map(Number);
        if (!isNaN(index1) && !isNaN(index2)) {
          EventBus.emit("connectCircles", { index1, index2 });
          output = `Connecting circle ${index1} to circle ${index2}...`;
        } else {
          output = "Invalid parameters. Please provide valid indices.";
        }
      } else {
        output = "Invalid command format. Use: connect [index1] [index2]";
      }
    } else {
      output = `Unknown command: ${input}`;
    }
  
    setHistory(prev => [...prev, { command: input, output }]);
    setInput("");
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand();
    }
  };

  // Focus the input field when the component mounts or history updates
  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  // Automatically scroll to the bottom when history updates
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="terminal" onClick={handleTerminalClick}>
      <div className="terminal-output" ref={outputRef}>
        {history.map((entry, index) => (
          <div key={index} className="terminal-entry">
            <span className="terminal-command">{"$ " + entry.command}</span>
            <span className="terminal-output-text">{entry.output}</span>
          </div>
        ))}
      </div>
      <div className="terminal-input">
        <span className="terminal-prompt">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-textbox"
        />
      </div>
    </div>
  );
}

export default Terminal;