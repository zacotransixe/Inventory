import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import { FaEdit, FaTrashAlt, FaSearch, FaPlus } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const ExpensesContainer = styled.div`
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
font-family: Aptos Display;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const StylishButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #002985; /* Primary blue */
  color: white;
font-family: Aptos Display;
font-size:18px;  font-weight: bold;
  border: none;
    border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #2980b9; /* Darker blue on hover */
    transform: translateY(-3px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 4px #3498db;
  }
`;

const SearchBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  gap: 10px;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 200px;
  outline: none;
  font-family: Aptos Display;
font-size:16px;
`;

const TableContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
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
  font-family: Aptos Display;
  text-transform: uppercase;
`;

const StyledTableCell = styled.td`
  padding: 0.75rem;
  text-align: left;
  font-family: Aptos Display;
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

const NoResults = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 1.2rem;
  color: #888;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const Expenses = () => {
  const [expensesData, setExpensesData] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userRole, setUserRole] = useState(''); // State to store user role

  useEffect(() => {
    // Fetch user role from localStorage or context
    const userData = JSON.parse(localStorage.getItem('userData'));
    setUserRole(userData?.role || 'User'); // Default role is 'User'
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const expensesCollection = collection(db, 'expenses');
      const expenseSnapshot = await getDocs(expensesCollection);
      const expensesList = expenseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate
          ? doc.data().date.toDate().toISOString().split('T')[0] // Get yyyy-mm-dd
          : doc.data().date, // Fallback to the original date if not a Firestore Timestamp
      }));
      setExpensesData(expensesList);
      setFilteredExpenses(expensesList);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error fetching expenses: ' + error.message);
    }
  };


  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both From and To dates.');
      return;
    }

    setLoading(true);
    const from = new Date(fromDate).getTime();
    const to = new Date(toDate).getTime();

    const filtered = expensesData.filter((expense) => {
      const expenseDate = new Date(
        expense.date.split('-').reverse().join('-')
      ).getTime();
      return expenseDate >= from && expenseDate <= to;
    });

    setFilteredExpenses(filtered);
    setLoading(false);
  };

  const handleAddExpense = () => {
    window.open('/add-new-expense', '_blank');
  };

  const handleEditExpense = (expense) => {
    const queryParams = new URLSearchParams({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
    }).toString();
    window.open(`/add-new-expense?${queryParams}`, '_blank');
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setLoading(true);
        const expenseRef = doc(db, 'expenses', expenseId);
        await deleteDoc(expenseRef);
        toast.success('Expense deleted successfully!');
        const updatedExpenses = expensesData.filter(
          (expense) => expense.id !== expenseId
        );
        setExpensesData(updatedExpenses);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error('Error deleting expense: ' + error.message);
      }
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <ExpensesContainer>
      <ContentContainer>
        <Header>
          <Title>Expenses</Title>
          {userRole !== 'User' && ( // Hide Add Expense button for 'User'
            <StylishButton onClick={handleAddExpense}>
              <FaPlus /> Add Expense
            </StylishButton>
          )}
        </Header>

        <SearchBar>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From Date"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To Date"
          />
          <StylishButton onClick={handleSearch}>
            <FaSearch /> Search
          </StylishButton>
        </SearchBar>

        <TableContainer>
          {loading ? (
            <LoaderContainer>
              <Loader />
            </LoaderContainer>
          ) : filteredExpenses.length === 0 ? (
            <NoResults>No expenses found</NoResults>
          ) : (
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow>
                  <StyledTableHeader>Title</StyledTableHeader>
                  <StyledTableHeader>Amount</StyledTableHeader>
                  <StyledTableHeader>Date</StyledTableHeader>
                  {userRole !== 'User' && (
                    <StyledTableHeader>Actions</StyledTableHeader>
                  )}
                </StyledTableRow>
              </StyledTableHead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <StyledTableRow key={expense.id}>
                    <StyledTableCell>{expense.title}</StyledTableCell>
                    <StyledTableCell>{expense.amount}</StyledTableCell>
                    <StyledTableCell>{expense.date}</StyledTableCell>
                    {userRole !== 'User' && ( // Hide Edit/Delete buttons for 'User'
                      <StyledTableCell>
                        <ActionButtons>
                          <EditButton onClick={() => handleEditExpense(expense)}>
                            <FaEdit /> Edit
                          </EditButton>
                          <DeleteButton
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <FaTrashAlt /> Delete
                          </DeleteButton>
                        </ActionButtons>
                      </StyledTableCell>
                    )}
                  </StyledTableRow>
                ))}
              </tbody>
            </StyledTable>
          )}
        </TableContainer>
      </ContentContainer>
      <ToastContainer />
    </ExpensesContainer>
  );
};

export default Expenses;
