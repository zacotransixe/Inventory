import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import Modal from '../components/CustomerModal'; // Import the CustomerModal component
import { db } from '../firebase'; // Import Firebase config
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, limit, setDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify styles

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

const StylishButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #3498db; /* Primary blue color */
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 50px; /* Rounded edges */
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #2980b9; /* Darker blue on hover */
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2); /* Add a shadow on hover */
  }

  &:focus {
    outline: none;
    box-shadow: 0px 0px 5px 2px rgba(52, 152, 219, 0.6); /* Focus ring */
  }
`;

const EditButton = styled(StylishButton)`
  background-color: #f39c12; /* Yellow for edit */
  
  &:hover {
    background-color: #e67e22; /* Darker yellow on hover */
  }
`;

const DeleteButton = styled(StylishButton)`
  background-color: #e74c3c; /* Red for delete */
  
  &:hover {
    background-color: #c0392b; /* Darker red on hover */
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const StyledTableHead = styled.thead`
  background-color: #007bff;
  color: #fff;
`;

const StyledTableBody = styled.tbody`
  background-color: #fff;
`;

const StyledTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }

  &:hover {
    background-color: #e9ecef;
  }
`;

const StyledTableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #ddd;
`;

const StyledTableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Customers = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customersData, setCustomersData] = useState([]);
  const [newCustomerId, setNewCustomerId] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch customers from Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const customersCollection = collection(db, 'customers');
        const customerSnapshot = await getDocs(customersCollection);
        const customersList = customerSnapshot.docs.map(doc => ({
          firestoreId: doc.id, // Save the Firestore document ID
          ...doc.data(), // Spread the rest of the customer data (including id: 'CUS002')
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


  // Get the last customer ID and increment for the new customer
  const generateCustomerId = async () => {
    const customersCollection = collection(db, 'customers');
    const q = query(customersCollection, orderBy('id', 'desc'), limit(1));
    const lastCustomerSnapshot = await getDocs(q);

    if (lastCustomerSnapshot.empty) {
      return 'CUS001'; // If no customers exist, start with CUS001
    } else {
      const lastCustomerId = lastCustomerSnapshot.docs[0].data().id;
      const numericId = parseInt(lastCustomerId.replace('CUS', '')) + 1;
      return `CUS${String(numericId).padStart(3, '0')}`; // Generate next ID like CUS002, CUS003
    }
  };

  const handleAddCustomer = async () => {
    const newId = await generateCustomerId();
    setNewCustomerId(newId);
    setSelectedCustomer({ id: newId, customer: '' }); // Reset form for new customer with ID
    setModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer); // Load the selected customer's data
    setModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Handle saving or updating customer to Firestore
  const handleSaveCustomer = async (customerName) => {
    try {
      setLoading(true);

      if (selectedCustomer && selectedCustomer.id && customersData.some(customer => customer.id === selectedCustomer.id)) {
        // If the customer already exists, update it
        const customerInFirestore = customersData.find(customer => customer.id === selectedCustomer.id);
        const customerRef = doc(db, 'customers', customerInFirestore.firestoreId); // Use Firestore document ID

        await updateDoc(customerRef, {
          customer: customerName,
          id: selectedCustomer.id, // Keep the same custom ID like 'CUS002'
          created: selectedCustomer.created, // Preserve original creation date
          updated: new Date().toISOString(), // Add updated timestamp
        });

        toast.success('Customer updated successfully!');
      } else {
        // For new customers
        const newId = newCustomerId || (await generateCustomerId()); // Generate new customer ID
        const customerRef = doc(db, 'customers', newId); // Use this for creating a new document

        await setDoc(customerRef, {
          id: newId,
          customer: customerName,
          created: new Date().toISOString(), // Set created date
        });

        toast.success('Customer added successfully!');
      }

      handleModalClose(); // Close modal after save
      refreshCustomersData(); // Refresh customer list
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error saving customer: ' + error.message);
    }
  };


  // Delete a customer from Firestore
  // Delete a customer from Firestore
  const handleDeleteCustomer = async (firestoreId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        const customerRef = doc(db, 'customers', firestoreId); // Use Firestore document ID
        await deleteDoc(customerRef);
        toast.success('Customer deleted successfully!');
        refreshCustomersData();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error('Error deleting customer: ' + error.message);
      }
    }
  };


  // Refresh the list of customers
  const refreshCustomersData = async () => {
    const customersCollection = collection(db, 'customers');
    const customerSnapshot = await getDocs(customersCollection);
    const customersList = customerSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCustomersData(customersList);
  };

  return (
    <CustomersContainer>
      <Sidebar />
      <ContentContainer>
        <ButtonContainer>
          <StylishButton onClick={handleAddCustomer}>Add Customer</StylishButton>
        </ButtonContainer>

        <TableContainer>
          <StyledTable>
            <StyledTableHead>
              <StyledTableRow>
                <StyledTableHeader>ID</StyledTableHeader>
                <StyledTableHeader>Customer</StyledTableHeader>
                <StyledTableHeader>Created</StyledTableHeader>
                <StyledTableHeader>Actions</StyledTableHeader>
              </StyledTableRow>
            </StyledTableHead>
            <StyledTableBody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                customersData.map((customer) => (
                  <StyledTableRow key={customer.id}>
                    <StyledTableCell>{customer.id}</StyledTableCell>
                    <StyledTableCell>{customer.customer}</StyledTableCell>
                    <StyledTableCell>{customer.created}</StyledTableCell>
                    <StyledTableCell>
                      <ActionButtons>
                        <EditButton onClick={() => handleEditCustomer(customer)}>Edit</EditButton>
                        <DeleteButton onClick={() => handleDeleteCustomer(customer.firestoreId)}>Delete</DeleteButton>
                      </ActionButtons>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </StyledTableBody>
          </StyledTable>
        </TableContainer>

        {/* Modal for Adding or Editing Customer */}
        {modalOpen && (
          <Modal
            customer={selectedCustomer}
            onClose={handleModalClose}
            onSave={handleSaveCustomer} // Pass save function to modal
          />
        )}
      </ContentContainer>
      <ToastContainer /> {/* Toast notification container */}
    </CustomersContainer>
  );
};

export default Customers;
