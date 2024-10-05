import React, { useState } from 'react';
import styled from 'styled-components';
import Button from './Button';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #e0f7fa;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 300px;
  max-width: 100%;
`;

const ModalHeader = styled.h3`
  margin-top: 0;
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 14px;
  color: #555;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 100%;
  &:focus {
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-top: 1rem;
`;

const StyledButton = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 14px;
`;

const CustomerModal = ({ customer, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState(customer.customer);

  const handleSaveClick = () => {
    if (customerName.trim() === '') {
      alert('Customer name cannot be empty');
      return;
    }
    onSave(customerName); // Pass the updated customer name back to the parent component
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>Customer</ModalHeader>
        <FormGroup>
          <Label htmlFor="customer-id">ID</Label>
          <Input type="text" id="customer-id" value={customer.id} readOnly />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="customer-name">Customer</Label>
          <Input
            type="text"
            id="customer-name"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </FormGroup>
        <ButtonGroup>
          <StyledButton color="#28a745" hoverColor="#218838" onClick={handleSaveClick}>
            Save
          </StyledButton>
          <StyledButton color="#ffc107" hoverColor="#e0a800" onClick={onClose}>
            Cancel
          </StyledButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CustomerModal;
