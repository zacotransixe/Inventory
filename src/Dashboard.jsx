// src/Dashboard.jsx
import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaFileExport } from 'react-icons/fa';
import logo from './logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align to the left */
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #000;
  padding: 1rem 2rem;
  color: #fff;
  border-radius: 10px;
  margin-bottom: 2rem;
  width: 100%;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const NavLink = styled.button`
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    background-color: #218838;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #218838;
  }
`;

const Welcome = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  gap: 20px; /* Added gap between Welcome text and Logout button */
`;

const Logo = styled.img`
  width: 150px;
  height: auto;
  margin-right: 20px;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ color }) => color || '#28a745'};
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${({ hoverColor }) => hoverColor || '#218838'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column; /* Align elements vertically */
  gap: 20px; /* Increased gap between elements */
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 25%;
  align-items: center; /* Center align the elements inside the box */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center; /* Center align the contents */
  gap: 10px; /* Add space between label and input */
`;

const DateGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  gap: 10px;
`;

const Input = styled.input`
  padding: 0.5rem;  /* Reduced padding */
  font-size: 14px;  /* Adjusted font size */
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 100%;
  text-align: center; /* Center the text inside the input */
  &:focus {
    border-color: #007bff;
  }
`;

const DateInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center; /* Center the label */
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
`;

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 20px;
`;

const RightSideContainer = styled.div`
  flex-grow: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.username || 'User';

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <DashboardContainer>
            <Navbar>
                <Logo src={logo} alt="Logo" />
                <NavLinks>
                    <NavLink>Trips</NavLink>
                    <NavLink>Expenses</NavLink>
                    <NavLink>Reports</NavLink>
                    <NavLink>Customers</NavLink>
                    <NavLink>PRT</NavLink>
                    <NavLink>Admin</NavLink>
                    <NavLink>About</NavLink>
                </NavLinks>
                <Welcome>
                    <span>Welcome, {username}</span>
                    <Button color="#28a745" hoverColor="#218838" onClick={handleLogout}>
                        Logout
                    </Button>
                </Welcome>
            </Navbar>

            <ContentContainer>
                <FormContainer>
                    <DateGroup>
                        <FormGroup>
                            <DateInputWrapper>
                                <label>From</label>
                                <Input type="date" defaultValue="2024-08-01" />
                            </DateInputWrapper>
                        </FormGroup>
                        <FormGroup>
                            <DateInputWrapper>
                                <label>To</label>
                                <Input type="date" defaultValue="2024-08-22" />
                            </DateInputWrapper>
                        </FormGroup>
                    </DateGroup>
                    <FormGroup>
                        <Input type="text" placeholder="Enter customer name" />
                    </FormGroup>
                    <FormGroup>
                        <Input type="text" placeholder="Enter C/O name" />
                    </FormGroup>
                    <FormGroup>
                        <Input type="text" placeholder="Enter driver name" />
                    </FormGroup>
                    <FormGroup>
                        <Input type="text" placeholder="Enter truck details" />
                    </FormGroup>
                    <FormGroup>
                        <Input type="text" placeholder="Enter origin location" />
                    </FormGroup>
                    <FormGroup>
                        <Input type="text" placeholder="Enter destination" />
                    </FormGroup>
                    <ButtonGroup>
                        <Button color="#17a2b8" hoverColor="#138496">
                            <FaSearch /> Search
                        </Button>
                        <Button color="#343a40" hoverColor="#23272b">
                            <FaFileExport /> Export
                        </Button>
                    </ButtonGroup>
                </FormContainer>

                <RightSideContainer>
                    {/* Add any content you want in the right-side container */}
                </RightSideContainer>
            </ContentContainer>
        </DashboardContainer>
    );
};

export default Dashboard;
