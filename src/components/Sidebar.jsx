import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Sidebar container
const SidebarContainer = styled.div`
  width: 250px;
  border: 1px solid #002985; /* Updated border color */
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #e0e0e0;
`;




// Navigation list
const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top:60px;
`;


// Navigation link styles
const StyledAnchor = styled.a`
  background-color: #002985;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  display: block;

  &:hover {
    background-color: #218838;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #218838;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute; // Position it absolutely relative to the parent container
  top: 20px;          // Adjust the distance from the top as needed
  left: 60%;          // Center horizontally
  transform: translateX(-50%); // Adjust for centering
  z-index: 10;        // Ensure it stays above other elements
  margin-bottom: 20px; // Optional if you want some spacing below
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('User'); // Default role as 'User'



  useEffect(() => {
    // Check login status and role from localStorage on component mount
    const userData = JSON.parse(localStorage.getItem('userData'));

    console.log('Role : ', userData);

    setIsLoggedIn(userData?.isLoggedIn || false);
    setRole(userData?.role || 'User'); // Fetch role from localStorage
  }, []);

  const handleLogout = () => {
    localStorage.setItem('userData', JSON.stringify({ isLoggedIn: false }));
    setIsLoggedIn(false);
    navigate('/'); // Redirect to login page after logout
    window.location.reload(); // Refresh the page
  };

  const handleLogin = () => {
    navigate('/login'); // Redirect to login page
  };

  return (
    <SidebarContainer>
      <LogoContainer>

      </LogoContainer>

      {/* Navigation List */}
      <NavList>
        {/* Show menu items based on role */}
        {role === 'Admin' && (
          <>
            <li>
              <StyledAnchor href="/" target="_blank" rel="noopener noreferrer">Home</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/trips" target="_blank" rel="noopener noreferrer">Trips</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/expenses" target="_blank" rel="noopener noreferrer">Expenses</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/reports" target="_blank" rel="noopener noreferrer">Reports</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/customers" target="_blank" rel="noopener noreferrer">Customers</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/prt" target="_blank" rel="noopener noreferrer">Partner Expenses</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/admin" target="_blank" rel="noopener noreferrer">Admin</StyledAnchor>
            </li>
          </>
        )}
        {role === 'Accountant' && (
          <>
            <li>
              <StyledAnchor href="/" target="_blank" rel="noopener noreferrer">Home</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/trips" target="_blank" rel="noopener noreferrer">Trips</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/expenses" target="_blank" rel="noopener noreferrer">Expenses</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/reports" target="_blank" rel="noopener noreferrer">Reports</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/customers" target="_blank" rel="noopener noreferrer">Customers</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/prt" target="_blank" rel="noopener noreferrer">Partner Expenses</StyledAnchor>
            </li>
          </>
        )}
        {role === 'User' && (
          <>
            <li>
              <StyledAnchor href="/" target="_blank" rel="noopener noreferrer">Home</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/trips" target="_blank" rel="noopener noreferrer">Trips</StyledAnchor>
            </li>
            <li>
              <StyledAnchor href="/expenses" target="_blank" rel="noopener noreferrer">Expenses</StyledAnchor>
            </li>
          </>
        )}
        <li>
          <StyledAnchor href="/change-password" target="_blank" rel="noopener noreferrer">Change Password</StyledAnchor>
        </li>
      </NavList>

      {/* Welcome message and login/logout button */}
      <button
        onClick={isLoggedIn ? handleLogout : handleLogin}
        style={{
          backgroundColor: isLoggedIn ? '#d9534f' : '#28a745',
          marginTop: '20px',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isLoggedIn ? 'Logout' : 'Login'}
      </button>
    </SidebarContainer>
  );
};

export default Sidebar;
