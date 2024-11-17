// src/components/Modal.jsx
import React from 'react';
import styled from 'styled-components';
import Button from './Button';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Darker overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px; /* Smoother border radius */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); /* Deeper shadow for depth */
  width: 400px;
  max-width: 100%;
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
  font-size: 22px; /* Larger font size */
  font-weight: 600; /* Bolder font weight */
  border-bottom: 1px solid #eee; /* Subtle bottom border */
  padding-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px; /* Increased gap for better readability */
  margin-bottom: 1.5rem; /* Consistent bottom margin */
`;

const Label = styled.label`
  font-size: 14px;
  color: #555;
  font-weight: 500; /* Slightly bolder font for better emphasis */
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 15px; /* Slightly larger font for better readability */
  border: 1px solid #ddd; /* Lighter border color */
  border-radius: 6px; /* Smoother border radius */
  outline: none;
  width: 100%;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff; /* Blue border on focus */
    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1); /* Subtle focus shadow */
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px; /* Slightly increased gap for buttons */
  justify-content: center; /* Centered buttons for balanced layout */
  margin-top: 1rem;
`;

const StyledButton = styled(Button)`
  padding: 0.6rem 1.2rem; /* More padding for larger buttons */
  font-size: 16px; /* Larger font size for buttons */
  border-radius: 8px; /* Smoother button edges */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle button shadow */
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); /* Slightly larger shadow on hover */
  }
`;

const Modal = ({ onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>Expenses</ModalHeader>
        <FormGroup>
          <Label htmlFor="expense-id">ID</Label>
          <Input type="text" id="expense-id" defaultValue="0" readOnly />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="expense-date">Date</Label>
          <Input type="date" id="expense-date" defaultValue="2024-08-26" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="expense-amount">Amount</Label>
          <Input type="number" id="expense-amount" placeholder="Enter amount" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="expense-description">Description</Label>
          <Input type="text" id="expense-description" placeholder="Enter description" />
        </FormGroup>
        <ButtonGroup>
          <StyledButton color="#28a745" hoverColor="#218838">
            Save
          </StyledButton>
          <StyledButton color="#ffc107" hoverColor="#e0a800" onClick={onClose}>
            Cancel
          </StyledButton>
          <StyledButton color="#d9534f" hoverColor="#c9302c">
            Delete
          </StyledButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
