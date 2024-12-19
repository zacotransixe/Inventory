import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';

// Main container for the landing page
const LandingContainer = styled.div`
  display: flex; /* Makes sidebar and content appear side by side */
  min-height: 100vh;
  position: relative;

  &::before {
    content: "";
    background: url('/truck.jpg') no-repeat center center;
    background-size: cover;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3; /* Adjust opacity for background image */
    z-index: -1;
  }
`;

// Sidebar styling remains the same, but position it last using 'order'
const SidebarContainer = styled.div`
  flex: 0 0 250px; /* Fixed width for the sidebar */
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 1; /* Ensure sidebar stays above background */
  order: 2; /* Push sidebar to the right */
`;

// Content container styling
const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 10px;
  order: 1; /* Content appears first */
`;

const WelcomeMessage = styled.h1`
  font-size: 2.5rem;
  color: #002985;
  margin-top: 70px;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-top: -300px;
`;

const LogoImage = styled.img`
  max-width: 20%;
  height: auto;
  border-radius: 8px;
  margin-top: 10px;
`;

const LogoText = styled.span`
  font-size: 2.7rem;
  font-weight: bold;
  color: #002985;
  margin-left: 10px;
  margin-top: 40px;
  text-transform: uppercase;
`;

const LandingPage = () => {
  return (
    <LandingContainer>
      {/* Main Content */}
      <ContentContainer>
        <LogoContainer>
          <LogoImage src="/Logo.png" alt="Logo" />
          <LogoText>Trans</LogoText>
        </LogoContainer>
        <WelcomeMessage>Welcome to TripManager</WelcomeMessage>
        <Description>Your one-stop solution for managing trips, customers, expenses, and reports.</Description>
      </ContentContainer>

      {/* Sidebar */}
      <SidebarContainer>
        <Sidebar />
      </SidebarContainer>
    </LandingContainer>
  );
};

export default LandingPage;
