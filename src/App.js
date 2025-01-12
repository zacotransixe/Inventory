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
import Home from './pages/Home';
import AddNewTrip from './pages/AddNewTrip';
import AddNewExpense from './pages/AddNewExpense';
import AddNewCustomer from './pages/AddNewCustomer';
import ChangePassword from './pages/ChangePassword';
import NonPaymentPage from './pages/NonPaymentPage';


const App = () => {
  return (
    <Router>
      <Routes>



        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/trips" element={<Dashboard />} />
        <Route path="/addnewtrip" element={<AddNewTrip />} />
        <Route path="/add-new-expense" element={<AddNewExpense />} />
        <Route path="/add-new-customer" element={<AddNewCustomer />} />

        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/prt" element={<PRT />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/change-password" element={<ChangePassword />}
        />


        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

export default App;
