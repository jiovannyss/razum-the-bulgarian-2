import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Simple test pages
const Index = () => <div style={{padding: '20px'}}>Index Page Works!</div>;
const NotFound = () => <div style={{padding: '20px'}}>404 - Not Found</div>;

const App = () => {
  console.log('App with routing is rendering');
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', padding: '20px' }}>
      <h1>Glowter App - Testing</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
