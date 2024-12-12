import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { toast, ToastContainer } from 'react-toastify';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const PRTContainer = styled.div`
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
  background-color: #3498db;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-3px);
  }
`;

const FormContainer = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const InputField = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  select,
  input {
    padding: 0.7rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .rdt {
    input {
      width: 94%;
      padding: 0.7rem;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
  }
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
  background-color: #007bff;
  color: #fff;

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const StyledTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }

  &:hover {
    background-color: #e9ecef;
  }
`;

const StyledTableCell = styled.td`
  padding: 0.75rem;
  text-align: left;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #ddd;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background-color: #e74c3c;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    background-color: #c0392b;
    transform: scale(1.05);
  }
`;
const ActionButtons = styled.div`
  display: flex;
  gap: 10px; /* Add space between buttons */
`;


const PRT = () => {
  const [partnerNames, setPartnerNames] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [date, setDate] = useState(''); // Declare date and its setter
  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState('');
  const [prtData, setPrtData] = useState([]);
  const [editingId, setEditingId] = useState(null); // Track the ID of the item being edited


  const fetchPartnerNames = async () => {
    const adminCollection = collection(db, 'adminData');
    const snapshot = await getDocs(adminCollection);
    const names = snapshot.docs.map((doc) => doc.data().name);
    setPartnerNames(names);
  };

  const fetchPRTData = async () => {
    const prtCollection = collection(db, 'PRTData');
    const snapshot = await getDocs(prtCollection);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPrtData(data);
  };

  const handleSave = async () => {
    if (!selectedPartner || !date || !comment || !amount) {
      toast.error('All fields are required.');
      return;
    }

    try {
      const prtCollection = collection(db, 'PRTData');

      if (editingId) {
        // Edit existing entry
        const docRef = doc(db, 'PRTData', editingId);
        const updatedEntry = {
          partnerName: selectedPartner,
          date: date instanceof Date ? date : new Date(date), // Ensure the date is a JavaScript Date
          comment,
          amount,
        };
        await updateDoc(docRef, updatedEntry);
        setPrtData(prtData.map(entry => (entry.id === editingId ? { ...updatedEntry, id: editingId } : entry)));
        toast.success('Entry updated successfully.');
      } else {
        // Add new entry
        const newEntry = {
          partnerName: selectedPartner,
          date: date instanceof Date ? date : new Date(date), // Ensure the date is a JavaScript Date
          comment,
          amount,
        };
        const docRef = await addDoc(prtCollection, newEntry);
        setPrtData([...prtData, { ...newEntry, id: docRef.id }]);
        toast.success('Entry saved successfully.');
      }

      // Clear the form fields
      setSelectedPartner('');
      setDate('');
      setComment('');
      setAmount('');
      setEditingId(null); // Exit edit mode
    } catch (error) {
      toast.error('Error saving Entry: ' + error.message);
    }
  };


  const handleEdit = (entry) => {
    setSelectedPartner(entry.partnerName);
    setDate(
      entry.date && entry.date.seconds
        ? new Date(entry.date.seconds * 1000) // Convert Firestore Timestamp to Date
        : entry.date
    );
    setComment(entry.comment);
    setAmount(entry.amount);
    setEditingId(entry.id); // Enter edit mode
  };





  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const docRef = doc(db, 'PRTData', id);
        await deleteDoc(docRef);
        setPrtData(prtData.filter((entry) => entry.id !== id));
        toast.success('entry deleted successfully.');
      } catch (error) {
        toast.error('Error deleting Entry: ' + error.message);
      }
    }
  };

  useEffect(() => {
    fetchPartnerNames();
    fetchPRTData();
  }, []);

  return (
    <PRTContainer>
      <ContentContainer>
        <Header>
          <Title>Admin Expense</Title>
        </Header>

        <FormContainer>
          <InputField>
            <label>Select Partner</label>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
            >
              <option value="">Select</option>
              {partnerNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </InputField>
          <InputField>
            <label>Date</label>
            <Datetime
              value={date} // Pass the Date object
              onChange={(value) => setDate(value)} // Save the selected date
              timeFormat={false} // Disable time selection
              dateFormat="YYYY-MM-DD" // Display date in YYYY-MM-DD format
              closeOnSelect={true} // Close picker on selecting a date
            />



          </InputField>
          <InputField>
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </InputField>
          <InputField>
            <label>Comment</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter type of expense"
            />
          </InputField>

          <StylishButton onClick={handleSave}>
            {editingId ? 'Update' : 'Save'}
          </StylishButton>

        </FormContainer>

        <TableContainer>
          <StyledTable>
            <StyledTableHead>
              <StyledTableRow>
                <th>Partner Name</th>
                <th>Date</th>
                <th>Comment</th>
                <th>Amount</th>
                <th>Actions</th>
              </StyledTableRow>
            </StyledTableHead>
            <tbody>
              {prtData.map((entry) => (
                <StyledTableRow key={entry.id}>
                  <StyledTableCell>{entry.partnerName}</StyledTableCell>
                  <StyledTableCell>
                    {entry.date && entry.date.seconds
                      ? new Date(entry.date.seconds * 1000).toLocaleDateString() // Format Firestore Timestamp
                      : entry.date instanceof Date
                        ? entry.date.toLocaleDateString() // Format Date object
                        : entry.date}
                  </StyledTableCell>

                  <StyledTableCell>{entry.amount}</StyledTableCell>


                  <StyledTableCell>{entry.comment}</StyledTableCell>
                  <StyledTableCell>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEdit(entry)}>
                        <FaEdit /> Edit
                      </ActionButton>
                      <ActionButton onClick={() => handleDelete(entry.id)}>
                        <FaTrashAlt /> Delete
                      </ActionButton>
                    </ActionButtons>
                  </StyledTableCell>

                </StyledTableRow>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      </ContentContainer>
      <ToastContainer />
    </PRTContainer>
  );
};

export default PRT;
