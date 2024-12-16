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

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  background-color: ${(props) => (props.active ? '#6a11cb' : '#f9f9f9')};
  color: ${(props) => (props.active ? 'white' : '#333')};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #6a11cb;
    color: white;
  }
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
  const [activeTab, setActiveTab] = useState('PartnerManagement');
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    tempPassword: ''
  });

  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    percentage: '',
    startDate: '',
    status: 'Active',
    endDate: ''
  });

  const collectionRef = collection(db, 'adminData');

  const [editingId, setEditingId] = useState(null); // To track if the form is in edit mode

  const handleAddOrEditUser = async () => {
    if (editingId) {
      // Edit existing user
      const docRef = doc(db, 'users', editingId);
      await updateDoc(docRef, {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
      });
      setUsers(
        users.map((user) =>
          user.id === editingId ? { ...user, ...userFormData } : user
        )
      );
      alert('User updated successfully.');
      setEditingId(null); // Exit edit mode
    } else {
      // Add new user with temporary password
      const newUserData = { ...userFormData, password: 'Welcome123' };
      const newDoc = await addDoc(userCollectionRef, newUserData);
      setUsers([...users, { ...newUserData, id: newDoc.id }]);
      alert('User created successfully with temporary password: Welcome123');
    }

    // Reset form after adding or editing
    setUserFormData({ name: '', email: '', role: 'User', tempPassword: '' });
  };

  const handleEditUser = (user) => {
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setEditingId(user.id); // Enter edit mode
  };

  const handleCancelEdit = () => {
    setEditingId(null); // Exit edit mode
    setUserFormData({ name: '', email: '', role: 'User', tempPassword: '' }); // Reset form
  };

  // Fetch data from Firebase
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

  const handlePartnerChange = (e) => {
    const { name, value } = e.target;
    setPartnerFormData({ ...partnerFormData, [name]: value });
  };

  const [tableData, setTableData] = useState([]);

  const handleEdit = async (id) => {
    // Fetch the current data for the item to pre-fill the form
    const itemToEdit = tableData.find(item => item.id === id);
    setPartnerFormData(itemToEdit);
    setEditingId(id); // Store the ID of the item being edited
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      const docRef = doc(db, 'adminData', editingId);
      await updateDoc(docRef, partnerFormData); // Save updated data to Firebase
      setTableData(tableData.map(item => (item.id === editingId ? { ...partnerFormData, id: editingId } : item)));
      setPartnerFormData({ name: '', percentage: '', startDate: '', status: 'Active', endDate: '' });
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

  const [users, setUsers] = useState([]);
  const [changePasswordData, setChangePasswordData] = useState({
    email: '',
    newPassword: ''
  });

  const partnerCollectionRef = collection(db, 'adminData');
  const [partners, setPartners] = useState([]);


  const userCollectionRef = collection(db, 'users');

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(userCollectionRef);
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
  };

  const handleAddPartner = async () => {
    if (partnerFormData.status === 'Inactive' && !partnerFormData.endDate) {
      alert('End date is required for inactive status.');
      return;
    }
    const newDoc = await addDoc(partnerCollectionRef, partnerFormData);
    setPartners([...partners, { ...partnerFormData, id: newDoc.id }]);
    setPartnerFormData({ name: '', percentage: '', startDate: '', status: 'Active', endDate: '' });
  };



  const handleDeleteUser = async (id) => {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleAdd = async () => {
    if (partnerFormData.status === 'Inactive' && !partnerFormData.endDate) {
      alert('End date is required for inactive status.');
      return;
    }
    const newDoc = await addDoc(collectionRef, partnerFormData);
    setTableData([...tableData, { ...partnerFormData, id: newDoc.id }]);
    setPartnerFormData({ name: '', percentage: '', startDate: '', status: 'Active', endDate: '' });
  };



  return (
    <AdminContainer>
      <ContentContainer>
        <TabContainer>
          <Tab active={activeTab === 'PartnerManagement'} onClick={() => handleTabSwitch('PartnerManagement')}>
            Partner Management
          </Tab>
          <Tab active={activeTab === 'UserManagement'} onClick={() => handleTabSwitch('UserManagement')}>
            User Management
          </Tab>

        </TabContainer>

        {activeTab === 'PartnerManagement' && (
          <>
            <FormBox>
              {/* Partner Management Form */}
              <InputRow>
                <InputField>
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={partnerFormData.name}
                    onChange={handlePartnerChange}
                    placeholder="Enter Name"
                  />
                </InputField>
                <InputField>
                  <label>Percentage</label>
                  <input
                    type="number"
                    name="percentage"
                    value={partnerFormData.percentage}
                    onChange={handlePartnerChange}
                    placeholder="Enter Percentage"
                  />
                </InputField>
                <InputField>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={partnerFormData.startDate}
                    onChange={handlePartnerChange}
                  />
                </InputField>
                <InputField>
                  <label>Status</label>
                  <select
                    name="status"
                    value={partnerFormData.status}
                    onChange={handlePartnerChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </InputField>
                {partnerFormData.status === 'Inactive' && (
                  <InputField>
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={partnerFormData.endDate}
                      onChange={handlePartnerChange}
                    />
                  </InputField>
                )}
              </InputRow>
              {!editingId ? (
                <StyledButton onClick={handleAdd}>Add</StyledButton>
              ) : (
                <StyledButton onClick={handleSaveEdit}>Save Edit</StyledButton>
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

          </>
        )}

        {activeTab === 'UserManagement' && (
          <>
            <FormBox>
              <InputRow>
                <InputField>
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userFormData.name}
                    onChange={handleUserChange}
                    placeholder="Enter Name"
                  />
                </InputField>
                <InputField>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserChange}
                    placeholder="Enter Email"
                  />
                </InputField>
                <InputField>
                  <label>Role</label>
                  <select
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserChange}
                  >
                    <option value="User">User</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Admin">Admin</option>

                  </select>
                </InputField>
              </InputRow>

              {/* Show "Add" or "Save" button based on mode */}
              {!editingId ? (
                <StyledButton variant="add" onClick={handleAddOrEditUser}>
                  Add User
                </StyledButton>
              ) : (
                <>
                  <StyledButton variant="edit" onClick={handleAddOrEditUser}>
                    Save
                  </StyledButton>
                  <StyledButton variant="delete" onClick={handleCancelEdit}>
                    Cancel
                  </StyledButton>
                </>
              )}
            </FormBox>

            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {/* Edit button */}
                        <StyledButton
                          variant="edit"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </StyledButton>

                        {/* Delete button */}
                        <StyledButton
                          variant="delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </StyledButton>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>


          </>
        )}

      </ContentContainer>
    </AdminContainer>
  );
};

export default Admin;
