// src/pages/Expenses.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaEdit, FaTrashAlt } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { db } from '../firebase'; // Assuming Firebase config is set up
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // For notifications

const ExpensesContainer = styled.div`
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

const SearchBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 1rem 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  margin-right: 8px;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 200px; /* Fixed width for better alignment */
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const TableContainer = styled.div`
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    background-color: #f4f4f4;
    position: sticky;
    top: 0;
    z-index: 1;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Expenses = () => {
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [expensesData, setExpensesData] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    amount: '',
    date: '',
  });

  const isValidForm = () => {
    const { title, amount, date } = expenseFormData;
    if (!title || !amount || !date) {
      toast.error('Please fill in all fields.');
      return false;
    }
    return true;
  };


  const fetchExpenses = async () => {
    setLoading(true); // Show loader
    try {
      const expensesCollection = collection(db, "expenses");
      const expenseSnapshot = await getDocs(expensesCollection);
      const expensesList = expenseSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Object && data.date.toDate 
            ? data.date.toDate().toLocaleDateString() 
            : data.date,
        };
      });
      setExpensesData(expensesList);
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      toast.error("Error fetching expenses: " + error.message);
    } finally {
      setLoading(false); // Hide loader
    }
  };
  
  

  useEffect(() => {
    fetchExpenses();
  }, []);

  const openModal = () => {
    setSelectedExpense(null);
    setExpenseFormData({ title: '', amount: '', date: '' });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

 
  const handleSaveExpense = async () => {
    if (!isValidForm()) return;
  
    try {
      const newExpense = {
        ...expenseFormData,
        created: new Date().toISOString(),
      };
  
      console.log("Attempting to save expense:", newExpense);
  
      await addDoc(collection(db, "expenses"), newExpense);
  
      console.log("Expense saved successfully!");
      toast.success("Expense added successfully!");
      closeModal();
      fetchExpenses();
    } catch (error) {
      console.error("Error saving expense:", error.message);
      toast.error("Error saving expense: " + error.message);
    }
  };
  

  const handleEditExpense = (expense) => {
    console.log('Selected Expense for Editing:', expense); // Log the selected expense
    setSelectedExpense(expense); // Store the selected expense
    setExpenseFormData({
      title: expense.description || '',
      amount: expense.amount || '',
      date: expense.date || '',
    }); // Prefill the form data
    setModalOpen(true); // Open the modal
};

  
  

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleDateString(); // Converts to a readable date
  };
  
  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const expenseRef = doc(db, 'expenses', expenseId);
        await deleteDoc(expenseRef);
        toast.success('Expense deleted successfully!');
        fetchExpenses(); // Refresh expenses list
      } catch (error) {
        toast.error('Error deleting expense: ' + error.message);
      }
    }
  };

  return (
    <ExpensesContainer>
      <Sidebar />

      <ContentContainer>
        <SearchBar>
          <InputGroup>
            <Label htmlFor="from-date">From Date</Label>
            <Input type="date" id="from-date" defaultValue="2024-08-01" />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="to-date">To Date</Label>
            <Input type="date" id="to-date" defaultValue="2024-08-26" />
          </InputGroup>

          <ButtonGroup>
          <Button color="#17a2b8" hoverColor="#138496" onClick={fetchExpenses} disabled={loading}>
  {loading ? (
    <span>Loading...</span>
  ) : (
    <>
      <FaSearch /> Search
    </>
  )}
</Button>
            <Button
  color="#28a745"
  hoverColor="#218838"
  onClick={openModal} // Ensure it calls `openModal` to open the popup
>
  Add New
</Button>


          </ButtonGroup>
        </SearchBar>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expensesData.map((expense) => (
                <tr>
                  <td>{expense.description}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.date}</td>
                  <td>
                    <ActionButtons>
                      <Button color="#f0ad4e" hoverColor="#ec971f" onClick={() => handleEditExpense(expense)}>
                        <FaEdit /> Edit
                      </Button>
                      <Button color="#d9534f" hoverColor="#c9302c" onClick={() => handleDeleteExpense(expense.id)}>
                        <FaTrashAlt /> Delete
                      </Button>
                    </ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {modalOpen && (
          <Modal onClose={closeModal} selectedExpense={selectedExpense}>
            <h2>{selectedExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
            <form>
              <div>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={expenseFormData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={expenseFormData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={expenseFormData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <ButtonGroup>
              <Button
  color="#28a745"
  hoverColor="#218838"
  onClick={() => {
    console.log("Save button clicked");
    handleSaveExpense();
  }}
>
  Save
</Button>

                <Button color="#dc3545" hoverColor="#c9302c" onClick={closeModal}>
                  Cancel
                </Button>
              </ButtonGroup>
            </form>
          </Modal>
        )}

        <ToastContainer />
      </ContentContainer>
    </ExpensesContainer>
  );
};

export default Expenses;

