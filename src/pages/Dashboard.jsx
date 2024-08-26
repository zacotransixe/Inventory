// src/pages/Dashboard.jsx
import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaFileExport } from 'react-icons/fa';
import Sidebar from '../components/Sidebar'; // Import Sidebar component
import Button from '../components/Button';   // Import Button component

const DashboardContainer = styled.div`
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
`;

const SearchBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Four columns */
  gap: 15px;
  align-items: center;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 100%;
  text-align: left;

  &:focus {
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  grid-column: span 4; /* Span all four columns in the last row */
`;

const RightSideContainer = styled.div`
  flex-grow: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <Sidebar />

      <ContentContainer>
        <SearchBar>
          <Input type="date" defaultValue="2024-08-01" placeholder="From" />
          <Input type="date" defaultValue="2024-08-22" placeholder="To" />
          <Input type="text" placeholder="Customer name" />
          <Input type="text" placeholder="C/O name" />
          <Input type="text" placeholder="Driver name" />
          <Input type="text" placeholder="Truck details" />
          <Input type="text" placeholder="Origin location" />
          <Input type="text" placeholder="Destination" />

          {/* Aligning ButtonGroup to span all columns */}
          <ButtonGroup>
            <Button color="#17a2b8" hoverColor="#138496">
              <FaSearch /> Search
            </Button>
            <Button color="#343a40" hoverColor="#23272b">
              <FaFileExport /> Export
            </Button>
          </ButtonGroup>
        </SearchBar>

        <RightSideContainer>
          {/* Add any content you want in the right-side container */}
        </RightSideContainer>
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
