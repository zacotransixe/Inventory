// src/pages/About.jsx
import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';

const AboutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const Heading = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const Text = styled.p`
  font-size: 1rem;
  color: #666;
  text-align: center;
  max-width: 600px;
`;

const About = () => {
    return (
        <AboutContainer>
            <ContentContainer>
                <Heading>About Page</Heading>
                <Text>This is the About page. Learn more about this application and its features here.</Text>
            </ContentContainer>
        </AboutContainer>
    );
};

export default About;
