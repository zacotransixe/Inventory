import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: bold;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #555;
`;

const Input = styled.input`
  padding: 0.9rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  width: 100%;
  transition: border 0.3s ease;

  &:focus {
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${(props) => props.color || '#3498db'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => props.hoverColor || '#2980b9'};
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const AddNewCustomer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [customerFormData, setCustomerFormData] = useState({
        id: '',
        customer: '',
        created: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setCustomerFormData({
            id: params.get('id') || '',
            customer: params.get('customer') || '',
            created: params.get('created') || '',
        });
    }, [location.search]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        const { id, customer } = customerFormData;

        if (!customer) {
            toast.error('Please fill in the customer name.');
            return;
        }

        setLoading(true);
        try {
            if (id) {
                // Update customer
                const customerRef = doc(db, 'customers', id);
                await updateDoc(customerRef, { customer });
                toast.success('Customer updated successfully!');
            } else {
                // Add new customer
                await addDoc(collection(db, 'customers'), {
                    customer,
                    created: new Date().toISOString(),
                });
                toast.success('Customer added successfully!');
            }

            setLoading(false);
            navigate('/customers'); // Redirect back to the customers page
        } catch (error) {
            setLoading(false);
            toast.error('Error saving customer: ' + error.message);
        }
    };

    return (
        <Container>
            <Title>{customerFormData.id ? 'Edit Customer' : 'Add New Customer'}</Title>
            <Form onSubmit={handleSaveCustomer}>
                <FormGroup>
                    <Label htmlFor="customer">Customer Name</Label>
                    <Input
                        type="text"
                        id="customer"
                        name="customer"
                        value={customerFormData.customer}
                        onChange={handleInputChange}
                        placeholder="Enter customer name"
                    />
                </FormGroup>
                <ButtonGroup>
                    <Button type="submit" color="#3498db" hoverColor="#2980b9" disabled={loading}>
                        {loading ? 'Saving...' : customerFormData.id ? 'Update' : 'Save'}
                    </Button>
                    <Button
                        type="button"
                        color="#e74c3c"
                        hoverColor="#c0392b"
                        onClick={() => navigate('/customers')}
                    >
                        Cancel
                    </Button>
                </ButtonGroup>
            </Form>
            <ToastContainer />
        </Container>
    );
};

export default AddNewCustomer;
