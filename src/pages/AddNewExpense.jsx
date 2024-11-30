import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    border-color: #28a745;
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
  background-color: ${(props) => props.color || '#28a745'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => props.hoverColor || '#218838'};
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  width: 25px;
  height: 25px;
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

const AddNewExpense = () => {
    const location = useLocation();
    const [expenseFormData, setExpenseFormData] = useState({
        id: '',
        title: '',
        amount: '',
        date: '',
    });
    const [loading, setLoading] = useState(false); // Loader state

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setExpenseFormData({
            id: params.get('id') || '',
            title: params.get('title') || '',
            amount: params.get('amount') || '',
            date: params.get('date') || '',
        });
    }, [location.search]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExpenseFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveExpense = async (e) => {
        e.preventDefault();
        const { id, title, amount, date } = expenseFormData;

        if (!title || !amount || !date) {
            toast.error('Please fill in all fields.');
            return;
        }

        setLoading(true); // Start loader
        try {
            if (id) {
                const expenseRef = doc(db, 'expenses', id);
                await updateDoc(expenseRef, { title, amount, date: new Date(date) });
                toast.success('Expense updated successfully!');
            } else {
                await addDoc(collection(db, 'expenses'), {
                    title,
                    amount,
                    date: new Date(date),
                });
                toast.success('Expense added successfully!');
                // Clear the form after adding a new expense
                setExpenseFormData({
                    id: '',
                    title: '',
                    amount: '',
                    date: '',
                });
            }
        } catch (error) {
            toast.error('Error saving expense: ' + error.message);
        } finally {
            setLoading(false); // Stop loader
        }
    };

    return (
        <Container>
            <Title>{expenseFormData.id ? 'Edit Expense' : 'Add New Expense'}</Title>
            <Form onSubmit={handleSaveExpense}>
                <FormGroup>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        type="text"
                        id="title"
                        name="title"
                        value={expenseFormData.title}
                        onChange={handleInputChange}
                        placeholder="Enter expense title"
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        type="number"
                        id="amount"
                        name="amount"
                        value={expenseFormData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter expense amount"
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="date">Date</Label>
                    <Input
                        type="date"
                        id="date"
                        name="date"
                        value={expenseFormData.date}
                        onChange={handleInputChange}
                    />
                </FormGroup>
                <ButtonGroup>
                    <Button type="submit" color="#28a745" hoverColor="#218838" disabled={loading}>
                        {loading ? <Loader /> : expenseFormData.id ? 'Update' : 'Save'}
                    </Button>
                    <Button
                        type="button"
                        color="#dc3545"
                        hoverColor="#c9302c"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                </ButtonGroup>
            </Form>
            <ToastContainer />
        </Container>
    );
};

export default AddNewExpense;
