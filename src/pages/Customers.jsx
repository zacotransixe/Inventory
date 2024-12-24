import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomersContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f9;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const StylishButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #002985; /* Primary blue */
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;


  &:focus {
    outline: none;
    box-shadow: 0 0 4px #002985;
  }
`;

const TableContainer = styled.div`
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
`;

const StyledTableHead = styled.thead`
  background-color: #002985;
  color: #fff;
`;

const StyledTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const StyledTableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
`;

const StyledTableCell = styled.td`
  padding: 0.75rem;
  text-align: left;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #ddd;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const EditButton = styled(StylishButton)`
  background-color: #002985;

  &:hover {
    background-color: #002985;
  }
`;

const DeleteButton = styled(StylishButton)`
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #002985;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const NoResults = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  padding: 2rem;
`;

const formatDate = (dateString) => {
  if (!dateString) return ''; // Handle empty or invalid date
  const date = new Date(dateString);

  // Format date as dd-mm-yyyy
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();

  // Format time as hh:mm:ss
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};


const Customers = () => {
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch customers from Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const customersCollection = collection(db, 'customers');
        const customerSnapshot = await getDocs(customersCollection);
        const customersList = customerSnapshot.docs.map((doc) => ({
          firestoreId: doc.id,
          ...doc.data(),
        }));
        setCustomersData(customersList);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error('Error fetching customers: ' + error.message);
      }
    };

    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    window.open('/add-new-customer', '_blank');
  };

  const handleEditCustomer = (customer) => {
    const queryParams = new URLSearchParams({
      id: customer.firestoreId,
      customer: customer.customer,
      created: customer.created,
    }).toString();

    window.open(`/add-new-customer?${queryParams}`, '_blank');
  };

  const handleDeleteCustomer = async (firestoreId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        const customerRef = doc(db, 'customers', firestoreId);
        await deleteDoc(customerRef);
        toast.success('Customer deleted successfully!');
        // Refresh customers list
        const updatedCustomers = customersData.filter(
          (customer) => customer.firestoreId !== firestoreId
        );
        setCustomersData(updatedCustomers);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error('Error deleting customer: ' + error.message);
      }
    }
  };

  return (
    <CustomersContainer>
      <ContentContainer>
        <Header>
          <Title>Customers</Title>
          <StylishButton onClick={handleAddCustomer}>Add Customer</StylishButton>
        </Header>

        <TableContainer>
          {loading ? (
            <LoaderContainer>
              <Loader />
            </LoaderContainer>
          ) : customersData.length === 0 ? (
            <NoResults>No customers found</NoResults>
          ) : (
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow>
                  <StyledTableHeader>Customer</StyledTableHeader>
                  <StyledTableHeader>Created</StyledTableHeader>
                  <StyledTableHeader>Actions</StyledTableHeader>
                </StyledTableRow>
              </StyledTableHead>
              <tbody>
                {customersData.map((customer) => (
                  <StyledTableRow key={customer.firestoreId}>
                    <StyledTableCell>{customer.customer}</StyledTableCell>
                    <StyledTableCell>{formatDate(customer.created)}</StyledTableCell>
                    <StyledTableCell>
                      <ActionButtons>
                        <EditButton onClick={() => handleEditCustomer(customer)}>
                          Edit
                        </EditButton>
                        <DeleteButton
                          onClick={() => handleDeleteCustomer(customer.firestoreId)}
                        >
                          Delete
                        </DeleteButton>
                      </ActionButtons>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </tbody>
            </StyledTable>
          )}
        </TableContainer>
      </ContentContainer>
      <ToastContainer />
    </CustomersContainer>
  );
};

export default Customers;
