// src/App.js
import React, {ReactDOM} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css';
import LandingPage from './pages/LandingPage';
import MainPage from './pages/MainPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pages" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;