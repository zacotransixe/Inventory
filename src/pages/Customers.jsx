// src/pages/Customers.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import Modal from '../components/CustomerModal'; // Import the CustomerModal component

const CustomersContainer = styled.div`
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #d9534f; /* Red button */
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c9302c; /* Darker red on hover */
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(217, 83, 79, 0.4); /* Focus shadow */
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  border-radius: 8px; /* Rounded corners */
  overflow: hidden; /* To ensure the rounded corners are visible */
`;

const StyledTableHead = styled.thead`
  background-color: #007bff; /* Blue background for the header */
  color: #fff;
`;

const StyledTableBody = styled.tbody`
  background-color: #fff;
`;

const StyledTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2; /* Light grey background for even rows */
  }

  &:hover {
    background-color: #e9ecef; /* Slightly darker grey on hover */
  }
`;

const StyledTableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #ddd; /* Border for table header */
`;

const StyledTableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd; /* Border for table cells */
  font-size: 14px;
  color: #333;
`;

const Customers = () => {
    const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
    const [selectedCustomer, setSelectedCustomer] = useState(null); // State for selected customer

    const handleAddCustomer = () => {
        setSelectedCustomer({ id: '', customer: '' }); // Reset form for new customer
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const customersData = [
        { id: 1, customer: 'Feol', created: '2024-02-26 09:41' },
        { id: 2, customer: 'Expertise', created: '2024-03-07 05:38' },
        { id: 3, customer: 'Ultra Industries', created: '2024-02-29 23:32' },
        { id: 6, customer: 'Unique', created: '2024-03-03 12:26' },
        { id: 7, customer: 'Sudhir Rentals', created: '2024-04-09 16:25' },
    ];

    return (
        <CustomersContainer>
            <Sidebar />
            <ContentContainer>
                <ButtonContainer>
                    <AddButton onClick={handleAddCustomer}>Add Customer</AddButton>
                </ButtonContainer>
                <TableContainer>
                    <StyledTable>
                        <StyledTableHead>
                            <StyledTableRow>
                                <StyledTableHeader>ID</StyledTableHeader>
                                <StyledTableHeader>Customer</StyledTableHeader>
                                <StyledTableHeader>Created</StyledTableHeader>
                            </StyledTableRow>
                        </StyledTableHead>
                        <StyledTableBody>
                            {customersData.map((customer) => (
                                <StyledTableRow key={customer.id}>
                                    <StyledTableCell>{customer.id}</StyledTableCell>
                                    <StyledTableCell>{customer.customer}</StyledTableCell>
                                    <StyledTableCell>{customer.created}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </StyledTableBody>
                    </StyledTable>
                </TableContainer>

                {/* Modal for Adding or Editing Customer */}
                {modalOpen && (
                    <Modal
                        customer={selectedCustomer}
                        onClose={handleModalClose}
                    />
                )}
            </ContentContainer>
        </CustomersContainer>
    );
};

export default Customers;
