import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const initialFormData = {
    tripDate: '',
    truckPlateNumber: '',
    customerName: '',
    driverName: '',
    remarks: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      console.log('User logged in:', user);
    });
    return () => unsubscribe();
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
      <ContentContainer>
        <h2>Add New Trip</h2>
        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <InputLabel>Trip Date</InputLabel>
            <Input
              type="date"
              name="tripDate"
              value={formData.tripDate}
              onChange={handleInputChange}
              required
            />
          </InputWrapper>

          <InputWrapper>
            <InputLabel>Truck Plate Number</InputLabel>
            <Input
              type="text"
              name="truckPlateNumber"
              value={formData.truckPlateNumber}
              onChange={handleInputChange}
              required
            />
          </InputWrapper>

          <InputWrapper>
            <InputLabel>Customer Name</InputLabel>
            <Input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
          </InputWrapper>

          <InputWrapper>
            <InputLabel>Driver Name</InputLabel>
            <Input
              type="text"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
            />
          </InputWrapper>

          <InputWrapper>
            <InputLabel>Remarks</InputLabel>
            <Input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </InputWrapper>

          <SubmitButtonGroup>
            <SaveButton type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </SaveButton>
            <CancelButton type="button" onClick={() => setFormData(initialFormData)}>
              Cancel
            </CancelButton>
          </SubmitButtonGroup>
        </form>
        <ToastContainer />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default AddNewTrip;
