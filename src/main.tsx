import { createRoot } from 'react-dom/client';

// Super minimal test to isolate the issue
const TestApp = () => {
  return <div style={{padding: '20px', color: 'red', fontSize: '24px'}}>
    TEST APP WORKS - React is mounting successfully!
  </div>;
};

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<TestApp />);
} else {
  console.error('Root element not found!');
}
