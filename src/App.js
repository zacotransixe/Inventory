// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses'; // Import the new Expenses page
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Login from './pages/Login';
import PRT from './pages/PRT'; // Import PRT page
import Admin from './pages/Admin'; // Import Admin page
import About from './pages/About'; // Import About page
import Home from './pages/Home';
import AddNewTrip from './pages/AddNewTrip';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trips" element={<Dashboard />} />
        <Route path="/addnewtrip" element={<AddNewTrip />} />

        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/prt" element={<PRT />} /> {/* Add route for PRT */}
        <Route path="/admin" element={<Admin />} /> {/* Add route for Admin */}
        <Route path="/about" element={<About />} /> {/* Add route for About */}
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

export default App;
