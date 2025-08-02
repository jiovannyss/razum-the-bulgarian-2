import { createRoot } from 'react-dom/client';

const container = document.getElementById("root");
if (container) {
  console.log('Root container found');
  const root = createRoot(container);
  console.log('React root created');
  
  // Ultra minimal HTML element
  const testDiv = document.createElement('div');
  testDiv.textContent = 'Direct DOM Manipulation Works!';
  testDiv.style.padding = '20px';
  testDiv.style.backgroundColor = 'lightgreen';
  
  container.appendChild(testDiv);
  console.log('DOM element added directly');
} else {
  console.error('Root container not found!');
}
