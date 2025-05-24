import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
    </Router>
  );
};

export default App;
