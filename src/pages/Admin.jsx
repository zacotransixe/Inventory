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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
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
  border: 1px solid white;
  background-color: #002985;
  color: ${(props) => (props.active ? 'white' : '#fff')};
  cursor: pointer;
  transition: background-color 0.3s;
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
  background-color: #002985;;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const StylishButton = styled.button`
  background-color: #002985;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 8px 16px; /* Consistent padding for height */
  min-height: 40px; /* Ensures consistent height */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const EditButton = styled(StylishButton)`
  background-color: #002985;
  &:hover {
    background-color: #001f6b;
  }
`;

const DeleteButton = styled(StylishButton)`
  background-color: #e74c3c;
  &:hover {
    background-color: #c0392b;
  }
`;
const ActionButtons = styled.div`
  display: flex; 
  gap: 10px; /* Spacing between buttons */
  align-items: center; /* Align vertically */
  justify-content: flex-start; /* Align to the start of the row */
  flex-wrap: nowrap; /* Prevent buttons from wrapping */
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
  background-color:#002985;
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
  const [partnerInvestmentData, setPartnerInvestmentData] = useState({
    partnerName: '',
    date: '',
    type: 'Investment',
    remarks: '',
    amount: '',
  });
  const [investmentTableData, setInvestmentTableData] = useState([]);
  const [filteredInvestmentData, setFilteredInvestmentData] = useState([]);
  const [partners, setPartners] = useState([]);




  // Fetch partners from Firebase
  useEffect(() => {
    const fetchPartners = async () => {
      const collectionRef = collection(db, 'adminData');
      const snapshot = await getDocs(collectionRef);
      const partnerList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setPartners(partnerList);
    };

    fetchPartners();
  }, []);

  const [filterData, setFilterData] = useState({
    fromDate: '',
    toDate: '',
    partnerName: '',
  });

  const handleFilterInvestments = () => {
    let filteredData = investmentTableData;



    if (filterData.partnerName) {
      filteredData = filteredData.filter(
        (investment) => investment.partnerName === filterData.partnerName
      );
    }

    setInvestmentTableData(filteredData);
  };



  const handleEditInvestment = (investment) => {
    setPartnerInvestmentData(investment);
    setEditingId(investment.id); // Set editing ID
  };



  // Handle Delete Investment
  const handleDeleteInvestment = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this investment?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'partnerInvestments', id));
        setInvestmentTableData(investmentTableData.filter((item) => item.id !== id));
        toast.success('Investment deleted successfully.');
      } catch (error) {
        toast.error('Error deleting investment: ' + error.message);
      }
    }
  };

  // Handle cancel edit
  const handlePartnerCancelEdit = () => {
    setPartnerInvestmentData({ partnerName: '', date: '', type: 'Investment', remarks: '', amount: '' });
    setEditingId(null); // Exit edit mode
  };


  // Fetch investment data from Firebase
  const fetchInvestmentData = async () => {
    const collectionRef = collection(db, 'partnerInvestments');
    const snapshot = await getDocs(collectionRef);
    const investmentData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort by date descending
    const sortedData = investmentData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setInvestmentTableData(sortedData); // Set original data
    setFilteredInvestmentData(sortedData); // Set filtered data initially
    // 
  };

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const handlePartnerInvestmentChange = (e) => {
    const { name, value } = e.target;
    setPartnerInvestmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveInvestment = async () => {
    const { partnerName, date, type, remarks, amount } = partnerInvestmentData;

    if (!partnerName || !date || !type || !amount) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        // Update investment
        const docRef = doc(db, 'partnerInvestments', editingId);
        await updateDoc(docRef, partnerInvestmentData);
        setInvestmentTableData(
          investmentTableData.map((item) =>
            item.id === editingId ? { id: editingId, ...partnerInvestmentData } : item
          )
        );
        toast.success('Investment updated successfully!');
      } else {
        // Add new investment
        const collectionRef = collection(db, 'partnerInvestments');
        const newDoc = await addDoc(collectionRef, partnerInvestmentData);
        const newData = { id: newDoc.id, ...partnerInvestmentData };
        const updatedData = [newData, ...investmentTableData]; // Add new data at the top
        setInvestmentTableData(updatedData);
        setFilteredInvestmentData(updatedData); // Update filtered data as well
        toast.success('Investment added successfully!');
      }

      setPartnerInvestmentData({ partnerName: '', date: '', type: 'Investment', remarks: '', amount: '' });
      setEditingId(null);
    } catch (error) {
      toast.error('Error saving investment: ' + error.message);
    }
  };

  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    percentage: '',
    startDate: '',
    status: 'Active',
    endDate: ''
  });

  const collectionRef = collection(db, 'adminData');

  const [editingId, setEditingId] = useState(null); // To track if the form is in edit mode

  const validateUserForm = () => {
    const { name, email, role } = userFormData;

    if (!name) return 'Name is required.';
    if (!email) return 'A valid username required.';
    if (!role) return 'Role is required.';
    return false; // Validation passed
  };

  const handleAddOrEditUser = async () => {
    const validationError = validateUserForm();
    if (validationError) {
      alert(validationError); // Display the validation error
      return;
    }

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

  const handleCancelEdit1 = () => {
    setEditingId(null); // Exit edit mode
    setPartnerFormData({ name: '', percentage: '', startDate: '', status: 'Active', endDate: '' }); // Reset form
  };

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const collectionRef = collection(db, 'adminData'); // Move collectionRef here
      const querySnapshot = await getDocs(collectionRef);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTableData(data);
    };

    fetchData();
  }, []); // Keep dependency array empty


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
    const confirmDelete = window.confirm('Are you sure you want to delete this partner?');
    if (confirmDelete) {
      const docRef = doc(db, 'adminData', id);
      await deleteDoc(docRef);
      setTableData(tableData.filter(item => item.id !== id));
      alert('Partner deleted successfully.');
    }
  };

  const [users, setUsers] = useState([]);

  const userCollectionRef = collection(db, 'users');

  useEffect(() => {
    const fetchUsers = async () => {
      const userCollectionRef = collection(db, 'users'); // Move userCollectionRef here
      const querySnapshot = await getDocs(userCollectionRef);
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));
      setUsers(data);
    };

    fetchUsers();
  }, []); // Keep dependency array empty


  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      const docRef = doc(db, 'users', id);
      await deleteDoc(docRef);
      setUsers(users.filter((user) => user.id !== id));
      alert('User deleted successfully.');
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const validatePartnerForm = () => {
    const { name, percentage, startDate, status, endDate } = partnerFormData;

    if (!name.trim()) return 'Name is required.';
    if (!percentage || isNaN(percentage) || percentage <= 0) return 'Percentage must be a valid positive number.';
    if (!startDate) return 'Start Date is required.';
    if (status === 'Inactive' && !endDate) return 'End Date is required for inactive status.';
    return false; // Validation passed
  };

  const handleAdd = async () => {
    const validationError = validatePartnerForm();
    if (validationError) {
      alert(validationError); // Display the validation error
      return;
    }

    try {
      const newDoc = await addDoc(collectionRef, partnerFormData);
      setTableData([...tableData, { ...partnerFormData, id: newDoc.id }]);
      setPartnerFormData({ name: '', percentage: '', startDate: '', status: 'Active', endDate: '' });
      alert('Partner added successfully.');
    } catch (error) {
      alert('Error adding partner: ' + error.message);
    }
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
          <Tab active={activeTab === 'PartnerInvestment'} onClick={() => handleTabSwitch('PartnerInvestment')}>
            Partner Investment
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
                <StyledButton onClick={handleAdd}>Add Partner</StyledButton>
              ) : (
                <ActionButtons>
                  <StyledButton variant="edit" onClick={handleSaveEdit}>
                    Save
                  </StyledButton>
                  <DeleteButton variant="delete" onClick={handleCancelEdit1}>
                    Cancel
                  </DeleteButton>
                </ActionButtons>

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
                        <ActionButtons>
                          <EditButton onClick={() => handleEdit(item.id)}>Edit</EditButton>
                          <DeleteButton onClick={() => handleDelete(item.id)}>Delete</DeleteButton>
                        </ActionButtons>
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
                  <ActionButtons>
                    <StyledButton variant="edit" onClick={handleAddOrEditUser}>
                      Save
                    </StyledButton>
                    <DeleteButton variant="delete" onClick={handleCancelEdit}>
                      Cancel
                    </DeleteButton>
                  </ActionButtons>
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
                        <ActionButtons>
                          <EditButton onClick={() => handleEditUser(user)}>Edit</EditButton>
                          <DeleteButton onClick={() => handleDeleteUser(user.id)}>Delete</DeleteButton>
                        </ActionButtons>

                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>


          </>
        )}
        {activeTab === 'PartnerInvestment' && (
          <>
            {/* Form to Add/Edit Investment */}
            <FormBox>
              <InputRow>
                <InputField>
                  <label>Partner</label>
                  <select
                    name="partnerName"
                    value={partnerInvestmentData.partnerName}
                    onChange={handlePartnerInvestmentChange}
                  >
                    <option value="">Select Partner</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.name}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </InputField>
                <InputField>
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={partnerInvestmentData.date}
                    onChange={handlePartnerInvestmentChange}
                  />
                </InputField>
                <InputField>
                  <label>Type</label>
                  <select
                    name="type"
                    value={partnerInvestmentData.type}
                    onChange={handlePartnerInvestmentChange}
                  >
                    <option value="Investment">Investment</option>
                    <option value="Payment">Payment</option>
                  </select>
                </InputField>
                <InputField>
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={partnerInvestmentData.amount}
                    onChange={handlePartnerInvestmentChange}
                    placeholder="Enter Amount"
                  />
                </InputField>
                <InputField>
                  <label>Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={partnerInvestmentData.remarks}
                    onChange={handlePartnerInvestmentChange}
                    placeholder="Enter Remarks"
                  />
                </InputField>
              </InputRow>
              <ActionButtons>
                <StyledButton onClick={handleSaveInvestment}>
                  {editingId ? 'Update' : 'Save'}
                </StyledButton>
                {editingId && (
                  <DeleteButton onClick={handlePartnerCancelEdit}>Cancel</DeleteButton>
                )}
              </ActionButtons>
            </FormBox>

            {/* Investment Table */}
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <th>Partner</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {investmentTableData.map((investment) => (
                    <tr key={investment.id}>
                      <td>{investment.partnerName}</td>
                      <td>{investment.date}</td>
                      <td>{investment.type}</td>
                      <td>{investment.amount}</td>
                      <td>{investment.remarks}</td>
                      <td>
                        <ActionButtons>
                          <EditButton onClick={() => handleEditInvestment(investment)}>Edit</EditButton>
                          <DeleteButton onClick={() => handleDeleteInvestment(investment.id)}>Delete</DeleteButton>
                        </ActionButtons>
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
