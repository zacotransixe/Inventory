// src/pages/Expenses.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Modal from '../components/Modal';

const ExpensesContainer = styled.div`
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 1rem 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  margin-right: 8px;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 200px; /* Fixed width for better alignment */
  padding-left: 2rem; /* Make room for the icon */
`;

const IconContainer = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Expenses = () => {
    const [modalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <ExpensesContainer>
            <Sidebar />

            <ContentContainer>
                <SearchBar>
                    <InputGroup>
                        <Label htmlFor="from-date">From Date</Label>

                        <Input type="date" id="from-date" defaultValue="2024-08-01" />
                    </InputGroup>

                    <InputGroup>
                        <Label htmlFor="to-date">To Date</Label>

                        <Input type="date" id="to-date" defaultValue="2024-08-26" />
                    </InputGroup>

                    <ButtonGroup>
                        <Button color="#17a2b8" hoverColor="#138496">
                            <FaSearch /> Search
                        </Button>
                        <Button color="#d9534f" hoverColor="#c9302c" onClick={openModal}>
                            <FaPlus /> Add New
                        </Button>
                    </ButtonGroup>
                </SearchBar>

                {/* Your expenses content goes here */}

                {modalOpen && <Modal onClose={closeModal} />}
            </ContentContainer>
        </ExpensesContainer>
    );
};

export default Expenses;
