import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { db, auth } from '../firebase';
import { doc, addDoc, updateDoc, collection, getDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams


// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalInput = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const SectionContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 20px; /* Space between controls */
  margin-bottom: 20px;
  border: 1px solid #ccc; /* Add border */
  border-radius: 5px; /* Optional: Add rounded corners */
  padding: 20px; /* Optional: Add padding inside the section */
  background-color: #fff; /* Optional: Add background color */
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const Select = styled.select`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 100%;
  background-color: #fff;
  &:focus {
    border-color: #007bff;
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
`;

const SubmitButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: ${spin} 1s linear infinite;
`;

const AddNewTrip = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);


  const initialFormData = {
    slNo: '',
    tripDate: '',
    truckPlateNumber: '',
    truckDriverName: '',
    truckCategory: '',
    deliveryNote: '',
    customerName: '',
    cO: '', // Correct field name
    firstLoading: '',
    firstOffloading: '',
    secondLoading: '',
    secondOffloading: '',
    customerRate: '',
    customerWaitingCharges: '',
    amountReceived: '',
    amountBalance: '',
    driverRate: '',
    driverWaitingCharges: '',
    amountPaid: '',
    transactionAmountBalance: '', // Correct field name
    invoiceNo: '',
    invoiceDate: '',
    remarks: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditMode, setIsEditMode] = useState(false); // Track if editing mode

  const [searchParams] = useSearchParams(); // Use useSearchParams hook

  useEffect(() => {
    // Check if editing mode (id exists in query params)
    const id = searchParams.get('id');
    if (id) {
      setIsEditMode(true); // Set editing mode
      fetchRecord(id); // Fetch record data
    }
  }, [searchParams]);

  // Fetch record data by ID for editing
  const fetchRecord = async (id) => {
    try {
      const docRef = doc(db, 'trips', id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        setFormData(docSnapshot.data());
      } else {
        toast.error('Record not found!');
      }
    } catch (error) {
      console.error('Error fetching record:', error.message);
      toast.error('Error fetching record: ' + error.message);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('User logged in:', user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch customers from Firebase
    const fetchCustomers = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const customerList = customersSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().customer,
        }));
        setCustomers(customerList);
      } catch (error) {
        console.error('Error fetching customers:', error.message);
        toast.error('Error loading customers: ' + error.message);
      }
    };

    fetchCustomers();
  }, []);


  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submit triggered.');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.tripDate || !formData.truckPlateNumber || !formData.customerName) {
        toast.error('Please fill in all required fields!');
        setLoading(false);
        return;
      }

      const id = searchParams.get('id'); // Get the record ID from the query params
      const dataToSave = {
        ...formData,
        created: new Date().toISOString(),
      };

      console.log('Saving the following data:', dataToSave);

      if (isEditMode) {
        // Update existing record
        const docRef = doc(db, 'trips', id);
        await updateDoc(docRef, dataToSave);
        toast.success('Record updated successfully!');
        console.log('Document updated with ID:', docRef.id);
      } else {
        // Add new record
        const newDocRef = await addDoc(collection(db, 'trips'), dataToSave);
        toast.success('Record added successfully!');
        console.log('Document added with ID:', newDocRef.id);
      }

      // Reset form after saving
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error saving trip data:', error.message);
      toast.error('Error saving trip data: ' + error.message);
    } finally {
      setLoading(false);
      console.log('Loading state reset to false.');
    }
  };


  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const newCustomer = {
        customer: newCustomerName, created: new Date().toISOString(), // Set created date
      };
      await addDoc(collection(db, 'customers'), newCustomer);
      setCustomers((prev) => [...prev, { created: Date.now(), customer: newCustomerName }]);
      toast.success('Customer added successfully!');
      setNewCustomerName('');
      setIsCustomerModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding customer:', error.message);
      toast.error('Failed to add customer: ' + error.message);
    } finally {
    }
  };

  return (
    <DashboardContainer>
      <ContentContainer>
        {loading ? (
          <LoaderContainer>
            <Loader />
          </LoaderContainer>
        ) : (
          <form onSubmit={handleSubmit}>
            <center><h2>Trip Data Entry</h2></center>
            <SectionContainer>
              <InputWrapper>
                <Label>Date:</Label>
                <Input
                  type="date"
                  name="tripDate"
                  value={formData.tripDate}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
            </SectionContainer>

            <h3>Truck Info</h3>
            <SectionContainer>
              <InputWrapper>
                <Label>Truck Plate Number:</Label>
                <Input
                  type="text"
                  name="truckPlateNumber"
                  value={formData.truckPlateNumber}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Truck Driver Name:</Label>
                <Input
                  type="text"
                  name="truckDriverName"
                  value={formData.truckDriverName}
                  onChange={handleInputChange}
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Truck Category:</Label>
                <Input
                  type="text"
                  name="truckCategory"
                  value={formData.truckCategory}
                  onChange={handleInputChange}
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Delivery Note:</Label>
                <Select
                  name="deliveryNote"
                  value={formData.deliveryNote}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="Received">Received</option>
                  <option value="Not Received">Not Received</option>
                </Select>
              </InputWrapper>
            </SectionContainer>

            <h3>Customer Info</h3>
            <SectionContainer>
              <InputWrapper>
                <Label>Customer Name:</Label>
                <Select
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Add Customer
                </button>
              </InputWrapper>
              <InputWrapper>
                <Label>C/O:</Label>
                <Input
                  type="text"
                  name="cO"
                  value={formData.cO}
                  onChange={handleInputChange}

                />
              </InputWrapper>
            </SectionContainer>

            <h3>Loading and Offloading Details</h3>
            <SectionContainer>
              <InputWrapper>
                <Label>First Loading:</Label>
                <Input
                  type="text"
                  name="firstLoading"
                  value={formData.firstLoading}
                  onChange={handleInputChange}

                />
              </InputWrapper>
              <InputWrapper>
                <Label>First Offloading:</Label>
                <Input
                  type="text"
                  name="firstOffloading"
                  value={formData.firstOffloading}
                  onChange={handleInputChange}

                />
              </InputWrapper>
              <InputWrapper>
                <Label>Second Loading:(Optional)</Label>
                <Input
                  type="text"
                  name="secondLoading"
                  value={formData.secondLoading}
                  onChange={handleInputChange}
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Second Offloading:(Optional)</Label>
                <Input
                  type="text"
                  name="secondOffloading"
                  value={formData.secondOffloading}
                  onChange={handleInputChange}
                />
              </InputWrapper>
            </SectionContainer>

            <h3>Transaction Details</h3>
            <SectionContainer>
              <InputWrapper>
                <Label>Customer Rate:</Label>
                <Input
                  type="number"
                  name="customerRate"
                  value={formData.customerRate}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Customer Waiting Charges:</Label>
                <Input
                  type="number"
                  name="customerWaitingCharges"
                  value={formData.customerWaitingCharges}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Amount Received:</Label>
                <Input
                  type="number"
                  name="amountReceived"
                  value={formData.amountReceived}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Amount Balance:</Label>
                <Input
                  type="number"
                  name="amountBalance"
                  value={formData.amountBalance}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Driver Rate:</Label>
                <Input
                  type="number"
                  name="driverRate"
                  value={formData.driverRate}
                  onChange={handleInputChange}

                />
              </InputWrapper>
              <InputWrapper>
                <Label>Driver Waiting Charges:</Label>
                <Input
                  type="number"
                  name="driverWaitingCharges"
                  value={formData.driverWaitingCharges}
                  onChange={handleInputChange}

                />
              </InputWrapper>
              <InputWrapper>
                <Label>Amount Paid:</Label>
                <Input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Amount Balance:</Label>
                <Input
                  type="number"
                  name="transactionAmountBalance"
                  value={formData.transactionAmountBalance}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
            </SectionContainer>

            <h3>Invoice Details</h3>
            <SectionContainer>
              <InputWrapper>
                <Label>Invoice No:</Label>
                <Input
                  type="number"
                  name="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Invoice Date:</Label>
                <Input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                />
              </InputWrapper>
            </SectionContainer>

            <SubmitButtonGroup>
              <SaveButton type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </SaveButton>
              <CancelButton type="button" onClick={() => setFormData({ ...formData })}>
                Cancel
              </CancelButton>
            </SubmitButtonGroup>
          </form>
        )}


        {/* Add Customer Modal */}
        <Modal
          isOpen={isCustomerModalOpen}
          onRequestClose={() => setIsCustomerModalOpen(false)}
          contentLabel="Add New Customer"
          ariaHideApp={false}
          style={{
            overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
            content: { padding: '20px', borderRadius: '10px', maxWidth: '400px', margin: 'auto' },
          }}
        >
          <h2>Add New Customer</h2>
          <ModalForm onSubmit={handleAddCustomer}>
            <ModalInput
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="Customer Name"
              required
            />
            <ModalButtons>
              <button type="submit" style={{
                backgroundColor: '#28a745', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', // Hand cursor
              }}>
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                style={{
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer', // Hand cursor

                }}
              >
                Cancel
              </button>
            </ModalButtons>
          </ModalForm>
        </Modal>

        <ToastContainer />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default AddNewTrip;
