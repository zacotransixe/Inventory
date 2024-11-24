import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';


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
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const FormLabel = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    color: #dc3545;
  }
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

const InputLabel = styled.label`
  font-weight: bold;
  margin-bottom: 0.5rem;
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

const AddNewTrip = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
 

  const initialFormData = {
    slNo: '',
    tripDate: '',
    truckPlateNumber: '',
    truckDriverName: '',
    truckCategory: '',
    deliveryNote: '',
    customerName: '',
    cO: '',
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
    transactionAmountBalance: '',
    invoiceNo: '',
    invoiceDate: '',
    remarks: '',
  };

  const [formData, setFormData] = useState({
    slNo: '',
    tripDate: '',
    truckPlateNumber: '',
    truckDriverName: '',
    truckCategory: '',
    deliveryNote: '',
    customerName: '',
    cO: '',
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
    transactionAmountBalance: '',
    invoiceNo: '',
    invoiceDate: '',
    remarks: '',
  });

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      console.log('User logged in:', user);
    });
    return () => unsubscribe();
  }, []);

  const closeModal = () => setIsModalOpen(false);



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
      if (!formData.tripDate || !formData.truckPlateNumber || !formData.customerName) {
        console.warn('Validation failed: Missing required fields.');
        toast.error('Please fill in all required fields!');
        setLoading(false);
        return;
      }

      const dataToSave = {
        ...formData,
        created: new Date().toISOString(),
      };

      console.log('Saving the following data:', dataToSave);

      const docRef = await addDoc(collection(db, 'trips'), dataToSave);

      console.log('Document written with ID:', docRef.id);

      toast.success('Trip data saved successfully!');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error saving trip data:', error.message);
      toast.error('Error saving trip data: ' + error.message);
    } finally {
      setLoading(false);
      console.log('Loading state reset to false.');
    }
  };

  return (
    <DashboardContainer>
    <Sidebar />

      <ContentContainer>
        

        
      <form onSubmit={handleSubmit}>
  <h3>Trip Information</h3>
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
  </SectionContainer>

  <h3>Truck Info</h3>
  <SectionContainer>
    <InputWrapper>
      <Label>Truck Driver Name:</Label>
      <Input
        type="text"
        name="truckDriverName"
        value={formData.truckDriverName}
        onChange={handleInputChange}
        required
      />
    </InputWrapper>
    <InputWrapper>
      <Label>Truck Category:</Label>
      <Input
        type="text"
        name="truckCategory"
        value={formData.truckCategory}
        onChange={handleInputChange}
        required
      />
    </InputWrapper>
    <InputWrapper>
      <Label>Delivery Note:</Label>
      <Select
        name="deliveryNote"
        value={formData.deliveryNote}
        onChange={handleInputChange}
        required
      >
        <option value="">Select Status</option>
        <option value="Received">Received</option>
        <option value="Not Received">Not Received</option>
      </Select>
    </InputWrapper>
    <InputWrapper>
      <Label>Customer Name:</Label>
      <Input
        type="text"
        name="customerName"
        value={formData.customerName}
        onChange={handleInputChange}
        required
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
        required
      />
    </InputWrapper>
    <InputWrapper>
      <Label>First Offloading:</Label>
      <Input
        type="text"
        name="firstOffloading"
        value={formData.firstOffloading}
        onChange={handleInputChange}
        required
      />
    </InputWrapper>
    <InputWrapper>
      <Label>Second Loading:</Label>
      <Input
        type="text"
        name="secondLoading"
        value={formData.secondLoading}
        onChange={handleInputChange}
      />
    </InputWrapper>
    <InputWrapper>
      <Label>Second Offloading:</Label>
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
  </SectionContainer>

  <SubmitButtonGroup>
    <SaveButton type="submit">Save</SaveButton>
    <CancelButton type="button" onClick={closeModal}>Cancel</CancelButton>
  </SubmitButtonGroup>
</form>
   
          

        <ToastContainer />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default AddNewTrip;
