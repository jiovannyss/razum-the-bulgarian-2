import React from 'react';

// Ultra minimal App for debugging
const App = () => {
  console.log('App component is rendering');
  return React.createElement('div', { 
    style: { 
      minHeight: '100vh', 
      backgroundColor: 'blue', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    } 
  }, 'TEST - App Works!');
};

export default App;
