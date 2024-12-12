// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  color: #fff;
  text-align: center;
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  padding: 1rem;
  border-radius: 8px;
`;

const FormBox = styled.div`
  background-color: #fff;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const InputRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InputField = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  input,
  select {
    padding: 0.7rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
`;

const StyledButton = styled.button`
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${(props) =>
    props.variant === 'add' ? '#4caf50' : props.variant === 'edit' ? '#2196f3' : '#f44336'};
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const TableContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  color: white;

  th {
    padding: 1rem;
    text-align: left;
    border-bottom: 2px solid #ddd;
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(odd) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    percentage: '',
    startDate: '',
    status: 'Active',
    endDate: ''
  });
  const [tableData, setTableData] = useState([]);
  const [editingId, setEditingId] = useState(null); // Track the ID being edited
  const collectionRef = collection(db, 'adminData');

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collectionRef);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTableData(data);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    if (formData.status === 'Inactive' && !formData.endDate) {
      alert('End date is required for inactive status.');
      return;
    }
    const newDoc = await addDoc(collectionRef, formData);
    setTableData([...tableData, { ...formData, id: newDoc.id }]);
    setFormData({ name: '', percentage: '', startDate: '', status: 'Active', endDate: '' });
  };

  const handleEdit = async (id) => {
    const itemToEdit = tableData.find(item => item.id === id);
    setFormData(itemToEdit);
    setEditingId(id); // Set the ID of the item being edited
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      const docRef = doc(db, 'adminData', editingId);
      await updateDoc(docRef, formData);
      setTableData(tableData.map(item => (item.id === editingId ? { ...formData, id: editingId } : item)));
      setFormData({ name: '', percentage: '', startDate: '', status: 'Active', endDate: '' });
      setEditingId(null); // Clear the editing ID
    } else {
      alert("No item selected for editing.");
    }
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, 'adminData', id);
    await deleteDoc(docRef);
    setTableData(tableData.filter(item => item.id !== id));
  };

  return (
    <AdminContainer>
      <ContentContainer>
        <Heading>Admin Dashboard</Heading>
        <FormBox>
          <InputRow>
            <InputField>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
              />
            </InputField>
            <InputField>
              <label>Percentage</label>
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                placeholder="Enter Percentage"
              />
            </InputField>
            <InputField>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </InputField>
            <InputField>
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </InputField>
            {formData.status === 'Inactive' && (
              <InputField>
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </InputField>
            )}
          </InputRow>
          {!editingId ? (
            <StyledButton variant="add" onClick={handleAdd}>
              Add
            </StyledButton>
          ) : (
            <StyledButton variant="edit" onClick={handleSaveEdit}>
              Save Edit
            </StyledButton>
          )}
        </FormBox>

        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <th>Name</th>
                <th>Percentage</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.percentage}</td>
                  <td>{item.startDate}</td>
                  <td>{item.status}</td>
                  <td>{item.status === 'Inactive' ? item.endDate : '-'}</td>
                  <td>
                    <StyledButton
                      variant="edit"
                      onClick={() => handleEdit(item.id)}
                    >
                      Edit
                    </StyledButton>
                    <StyledButton
                      variant="delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </StyledButton>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ContentContainer>
    </AdminContainer>
  );
};

export default Admin;

