import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar'; // Assuming you have a Sidebar component
import { Link } from 'react-router-dom'; // Use this for navigation if you're using React Router

const LandingContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const WelcomeMessage = styled.h1`
  font-size: 2.5rem;
  color: #007bff;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const NavigationLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const NavLink = styled(Link)`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  &:hover {
    background-color: #0056b3;
  }
`;

const LandingPage = () => {
    return (
        <LandingContainer>
            <Sidebar />
            <ContentContainer>
                <WelcomeMessage>Welcome to TripManager</WelcomeMessage>
                <Description>Your one-stop solution for managing trips, customers, expenses, and reports.</Description>

            </ContentContainer>
        </LandingContainer>
    );
};

export default LandingPage;
