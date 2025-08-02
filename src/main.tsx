import React from 'react';
import { createRoot } from 'react-dom/client';

// Very simple React component
const SimpleApp = () => {
  return React.createElement('div', {
    style: { padding: '20px', backgroundColor: 'lightcoral', color: 'white' }
  }, 'Simple React Component Works!');
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(SimpleApp));
}
