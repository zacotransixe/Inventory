// src/components/Sidebar.jsx
import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

// Sidebar container
const SidebarContainer = styled.div`
  width: 250px;
  background-color: #000;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #fff;
`;

// Styled logo container
const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px; /* Adds space below the logo */
`;

// Styled logo image
const LogoImage = styled.img`
  max-width: 100%; /* Ensures the logo fits within the container */
  height: auto;
  border-radius: 8px; /* Optional: adds rounded corners */
`;

// Navigation list
const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

// Navigation link styles
const StyledNavLink = styled(NavLink)`
  background-color: #28a745;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  display: block; /* Makes the NavLink fill its parent container */

  &:hover {
    background-color: #218838;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #218838;
  }

  &.active {
    background-color: #218838; /* Active link color */
  }
`;

// Welcome message and logout section
const Welcome = styled.div`
  margin-top: auto;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Sidebar component
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || 'User';

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <SidebarContainer>
      {/* Logo section */}
      <LogoContainer>
        <LogoImage src="/Logo.jpeg" alt="Logo" />
      </LogoContainer>

      {/* Navigation List */}
      <NavList>
        <li><StyledNavLink to="/trips">Trips</StyledNavLink></li>
        <li><StyledNavLink to="/expenses">Expenses</StyledNavLink></li>
        <li><StyledNavLink to="/reports">Reports</StyledNavLink></li>
        <li><StyledNavLink to="/customers">Customers</StyledNavLink></li>
        <li><StyledNavLink to="/prt">PRT</StyledNavLink></li>
        <li><StyledNavLink to="/admin">Admin</StyledNavLink></li>
        <li><StyledNavLink to="/about">About</StyledNavLink></li>
      </NavList>

      {/* Welcome message and logout button */}
      <Welcome>
        <span>Welcome, {username}</span>
        <StyledNavLink to="/" onClick={handleLogout} style={{ backgroundColor: '#d9534f', marginTop: '20px' }}>
          Logout
        </StyledNavLink>
      </Welcome>
    </SidebarContainer>
  );
};

export default Sidebar;
