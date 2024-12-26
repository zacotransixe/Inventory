import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';


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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  border: none;
  border-bottom: 3px solid ${(props) => (props.active ? '#002985' : 'transparent')};
  background-color: ${(props) => (props.active ? '#f4f6f9' : '#fff')};
  color: ${(props) => (props.active ? '#002985' : '#333')};
  cursor: pointer;
  transition: background-color 0.3s, border-bottom 0.3s;

  &:hover {
    background-color: #f4f6f9;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTableHead = styled.thead`
  background-color: #002985;
  color: #fff;
  th {
    padding: 1rem;
    text-align: left;
    font-weight: bold;
  }
`;

const StyledTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const StyledTableCell = styled.td`
  padding: 1rem;
  text-align: left;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #ddd;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const EditButton = styled.button`
  background-color: #002985;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  background-color: #e74c3c;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;


const StylishButton = styled.button`
  background-color: #002985;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  min-height: 40px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background-color: #001f6b;
  }
`;



const PRT = () => {
  const [activeTab, setActiveTab] = useState('PartnerExpense'); // Track active tab
  const [partnerNames, setPartnerNames] = useState([]);
  const [partnerName, setPartnerName] = useState([]);


  const [selectedPartner, setSelectedPartner] = useState('');

  const [selectedIPartner, setSelectedIPartner] = useState('');
  const [selectedIDate, setSelectedIDate] = useState('');
  const [selectedIType, setSelectedIType] = useState('');
  const [selectedIAmount, setSelectedIAmount] = useState('');
  const [selectedIRemarks, setSelectedIRemarks] = useState('');


  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState('');
  const [partnerInvestmentData, setPartnerInvestmentData] = useState({
    partnerName1: '',
    date1: '',
    type: 'Investment',
    remarks: '',
    amount: '',
  });
  const [prtData, setPrtData] = useState([]); // State for Partner Expense Data
  const [investmentTableData, setInvestmentTableData] = useState([]); // State for Investment Data



  const fetchPRTData = async () => {
    const prtCollection = collection(db, 'PRTData');
    const snapshot = await getDocs(prtCollection);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPrtData(data);
  };


  const fetchPartnerNames = async () => {
    const adminCollection = collection(db, 'adminData');
    const snapshot = await getDocs(adminCollection);
    const names = snapshot.docs.map((doc) => doc.data().name);
    setPartnerNames(names);
  };


  const fetchInvestmentData = async () => {
    try {
      const investmentCollection = collection(db, "partnerInvestments");
      const snapshot = await getDocs(investmentCollection);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        credit: parseFloat(doc.data().credit || 0), // Ensure numeric value
        debit: parseFloat(doc.data().debit || 0),  // Ensure numeric value
      }));
      console.log("Fetched Investment Data:", data); // Debug fetched data
      setInvestmentTableData(data);
    } catch (error) {
      console.error("Error fetching investment data: ", error);
    }
  };


  useEffect(() => {
    fetchPartnerNames();
    fetchPRTData();
    fetchInvestmentData(); // Fetch investment data on component load
  }, []);




  const handleSaveExpense = async () => {
    if (!selectedPartner || !date || !amount || !comment) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const prtCollection = collection(db, 'PRTData');

      if (editingId) {
        // Update an existing entry
        const docRef = doc(db, 'PRTData', editingId);
        const updatedEntry = {
          partnerName: selectedPartner,
          date: date instanceof Date ? date : new Date(date), // Ensure the date is a Date object
          comment,
          amount,
        };
        await updateDoc(docRef, updatedEntry);

        setPrtData((prevData) =>
          prevData.map((entry) =>
            entry.id === editingId ? { ...updatedEntry, id: editingId } : entry
          )
        );
        toast.success('Expense updated successfully');
      } else {
        // Save a new entry
        const newEntry = {
          partnerName: selectedPartner,
          date: date instanceof Date ? date : new Date(date), // Ensure the date is a Date object
          comment,
          amount,
        };
        const docRef = await addDoc(prtCollection, newEntry);

        setPrtData((prevData) => [
          { ...newEntry, id: docRef.id },
          ...prevData,
        ]);
        toast.success('Expense saved successfully');
      }

      // Reset the form
      setSelectedPartner('');
      setDate('');
      setComment('');
      setAmount('');
      setEditingId(null); // Exit edit mode
    } catch (error) {
      toast.error('Error saving expense: ' + error.message);
    }
  };




  const handleEdit = (entry) => {
    setSelectedPartner(entry.partnerName);
    setDate(
      entry.date?.seconds
        ? new Date(entry.date.seconds * 1000) // Convert Firestore Timestamp to Date
        : entry.date instanceof Date
          ? entry.date // If already a Date object
          : new Date(entry.date) // If a string or other valid date format
    );
    setComment(entry.comment);
    setAmount(entry.amount);
    setEditingId(entry.id); // Track editing mode
  };


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const docRef = doc(db, 'PRTData', id);
        await deleteDoc(docRef);
        setPrtData((prevData) => prevData.filter((entry) => entry.id !== id));
        toast.success('Entry deleted successfully.');
      } catch (error) {
        toast.error('Error deleting entry: ' + error.message);
      }
    }
  };

  const handleEditInvestment = (entry) => {
    setSelectedIPartner(entry.partnerName);

    setSelectedIDate(
      entry.date?.seconds
        ? new Date(entry.date.seconds * 1000) // Convert Firestore timestamp
        : entry.date instanceof Date
          ? entry.date
          : new Date(entry.date)
    );

    // Check if the amount is stored in 'credit' or 'debit'
    if (entry.credit && entry.credit > 0) {
      setSelectedIType("Credit");
      setSelectedIAmount(entry.credit);
    } else if (entry.debit && entry.debit > 0) {
      setSelectedIType("Debit");
      setSelectedIAmount(entry.debit);
    } else {
      setSelectedIAmount(""); // Default to empty if neither is set
    }

    setSelectedIRemarks(entry.remarks || ""); // Handle optional remarks
    setEditingId(entry.id); // Enable editing mode
  };



  const handleDeleteInvestment = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        const docRef = doc(db, "partnerInvestments", id);
        await deleteDoc(docRef);
        setInvestmentTableData((prevData) =>
          prevData.filter((entry) => entry.id !== id)
        );
        toast.success("Investment deleted successfully.");
      } catch (error) {
        toast.error("Error deleting investment: " + error.message);
      }
    }
  };


  const handleCancelEdit = () => {
    setSelectedPartner('');
    setDate('');
    setComment('');
    setAmount('');
    setEditingId(null); // Exit edit mode
  };


  const handleSaveInvestment = async () => {
    if (!selectedIPartner) {
      toast.error("Please select a partner.");
      return;
    }

    if (!selectedIType) {
      toast.error("Please select a type (Credit or Debit).");
      return;
    }

    if (!selectedIAmount || isNaN(selectedIAmount) || Number(selectedIAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!selectedIDate || !(selectedIDate instanceof Date) || isNaN(selectedIDate.getTime())) {
      toast.error("Please enter a valid date.");
      return;
    }

    try {
      const investmentCollection = collection(db, "partnerInvestments");

      const newInvestment = {
        partnerName: selectedIPartner,
        date: selectedIDate,
        debit: selectedIType === "Debit" ? Number(selectedIAmount) : 0, // Debit is set based on type
        credit: selectedIType === "Credit" ? Number(selectedIAmount) : 0, // Credit is set based on type
        remarks: selectedIRemarks || "", // Default to empty string if no remarks
      };

      if (editingId) {
        // Update existing investment
        const docRef = doc(db, "partnerInvestments", editingId);
        await updateDoc(docRef, newInvestment);

        setInvestmentTableData((prevData) =>
          prevData.map((entry) =>
            entry.id === editingId ? { ...newInvestment, id: editingId } : entry
          )
        );
        toast.success("Investment updated successfully.");
      } else {
        // Add new investment
        const docRef = await addDoc(investmentCollection, newInvestment);
        setInvestmentTableData((prevData) => [
          { ...newInvestment, id: docRef.id },
          ...prevData,
        ]);
        toast.success("Investment saved successfully.");
      }

      // Reset the form
      setSelectedIPartner("");
      setSelectedIDate(null);
      setSelectedIType("");
      setSelectedIAmount("");
      setSelectedIRemarks("");
      setEditingId(null);
    } catch (error) {
      toast.error("Error saving investment: " + error.message);
    }
  };






  const renderActiveTab = () => {
    if (activeTab === 'PartnerExpense') {
      return (
        <>
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
                value={date || ''}
                onChange={(value) => setDate(value)}
                timeFormat={false}
                dateFormat="YYYY-MM-DD"
              />
            </InputField>
            <InputField>
              <label>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </InputField>
            <InputField>
              <label>Comment</label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </InputField>

            <div style={{ display: 'flex', gap: '10px' }}>
              {editingId ? (
                <>
                  <StylishButton onClick={handleSaveExpense}>Update</StylishButton>
                  <StylishButton
                    onClick={handleCancelEdit}
                    style={{ backgroundColor: '#f39c12' }} // Distinct color for Cancel button
                  >
                    Cancel
                  </StylishButton>
                </>
              ) : (
                <StylishButton onClick={handleSaveExpense}>Save</StylishButton>
              )}
            </div>
          </FormContainer>

          <TableContainer>
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow>
                  <th>Partner Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </StyledTableRow>
              </StyledTableHead>
              <tbody>
                {prtData.map((entry) => (
                  <StyledTableRow key={entry.id}>
                    <StyledTableCell>{entry.partnerName}</StyledTableCell>
                    <StyledTableCell>
                      {/* Check if `date` is a Firestore Timestamp and convert it */}
                      {entry.date?.seconds
                        ? new Date(entry.date.seconds * 1000).toLocaleDateString() // Convert Firestore Timestamp to Date
                        : entry.date instanceof Date
                          ? entry.date.toLocaleDateString() // Render Date object
                          : entry.date} {/* Render string or other valid formats */}
                    </StyledTableCell>
                    <StyledTableCell>{entry.amount}</StyledTableCell>
                    <StyledTableCell>{entry.comment}</StyledTableCell>
                    <StyledTableCell>
                      <ActionButtons>
                        <EditButton onClick={() => handleEdit(entry)}>Edit</EditButton>
                        <DeleteButton onClick={() => handleDelete(entry.id)}>Delete</DeleteButton>
                      </ActionButtons>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>

        </>
      );
    }

    if (activeTab === 'PartnerInvestment') {
      return (
        <>
          <FormContainer>
            <InputField>
              <label>Partner</label>
              <select
                name="partnerName"
                value={selectedIPartner} // Ensure this reflects the current selected partner
                onChange={(e) => setSelectedIPartner(e.target.value)}
              >
                <option value="">Select Partner</option>
                {partnerNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField>
              <label>Date</label>
              <Datetime
                value={selectedIDate || ""} // If null, pass an empty string
                onChange={(value) => {
                  if (value && typeof value.toDate === "function") {
                    setSelectedIDate(value.toDate());
                  } else if (value instanceof Date && !isNaN(value.getTime())) {
                    setSelectedIDate(value);
                  } else {
                    setSelectedIDate(null); // Clear on invalid input
                  }
                }}
                timeFormat={false}
                dateFormat="YYYY-MM-DD"
              />
            </InputField>





            <InputField>
              <label>Type</label>
              <select
                name="type"
                value={selectedIType}
                onChange={(e) => setSelectedIType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </InputField>

            <InputField>
              <label>Amount</label>
              <input
                type="number"
                value={selectedIAmount}
                onChange={(e) => setSelectedIAmount(e.target.value)}
              />
            </InputField>
            <InputField>
              <label>Remarks</label>
              <input
                type="text"
                value={selectedIRemarks}
                onChange={(e) => setSelectedIRemarks(e.target.value)}
              />
            </InputField>

            <div style={{ display: "flex", gap: "10px" }}>
              {editingId ? (
                <>
                  <StylishButton onClick={handleSaveInvestment}>Update</StylishButton>
                  <StylishButton
                    onClick={handleCancelEdit}
                    style={{ backgroundColor: "#f39c12" }}
                  >
                    Cancel
                  </StylishButton>
                </>
              ) : (
                <StylishButton onClick={handleSaveInvestment}>Save</StylishButton>
              )}
            </div>
          </FormContainer>


          <TableContainer>
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow>
                  <th>Partner Name</th>
                  <th>Opening Balance</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Closing Balance</th>
                  <th>Actions</th>

                </StyledTableRow>
              </StyledTableHead>

              <tbody>
                {investmentTableData
                  // Sort by partner name first, then by date (oldest first)
                  .sort((a, b) => {
                    const partnerCompare = a.partnerName.localeCompare(b.partnerName);
                    if (partnerCompare !== 0) return partnerCompare; // Primary sort by partner name

                    // Secondary sort by date (oldest first)
                    const dateA = a.date
                      ? a.date.seconds
                        ? new Date(a.date.seconds * 1000) // Firebase Timestamp
                        : new Date(a.date)
                      : new Date(0); // Default to earliest possible date if missing

                    const dateB = b.date
                      ? b.date.seconds
                        ? new Date(b.date.seconds * 1000)
                        : new Date(b.date)
                      : new Date(0);

                    return dateA - dateB;
                  })
                  .map((investment, index, sortedData) => {
                    const previousClosingBalance =
                      index === 0 || sortedData[index - 1]?.partnerName !== investment.partnerName
                        ? 0 // Start with 0 for the first entry of a partner
                        : sortedData[index - 1].closingBalance || 0;

                    const debit = investment.debit ? Number(investment.debit) : 0;
                    const credit = investment.credit ? Number(investment.credit) : 0;

                    // Correct opening balance and closing balance calculations
                    const openingBalance = previousClosingBalance;
                    const closingBalance = openingBalance + credit - debit;

                    // Parse date for Month and Year
                    const parsedDate = investment.date
                      ? investment.date.seconds // Firebase Timestamp
                        ? new Date(investment.date.seconds * 1000)
                        : new Date(investment.date)
                      : null;

                    const month = parsedDate
                      ? parsedDate.toLocaleString("en-GB", { month: "long" })
                      : "Invalid Date";

                    const year = parsedDate ? parsedDate.getFullYear() : "Invalid Year";

                    // Attach the calculated closing balance to the current investment for continuity
                    investment.closingBalance = closingBalance;

                    return (
                      <StyledTableRow key={investment.id}>
                        <StyledTableCell>{investment.partnerName || "N/A"}</StyledTableCell>
                        <StyledTableCell>{openingBalance.toFixed(2)}</StyledTableCell>
                        <StyledTableCell>{month}</StyledTableCell>
                        <StyledTableCell>{year}</StyledTableCell>
                        <StyledTableCell>{debit.toFixed(2)}</StyledTableCell>
                        <StyledTableCell>{credit.toFixed(2)}</StyledTableCell>
                        <StyledTableCell>{closingBalance.toFixed(2)}</StyledTableCell>
                        <StyledTableCell>
                          <ActionButtons>
                            <EditButton onClick={() => handleEditInvestment(investment)}>Edit</EditButton>
                            <DeleteButton onClick={() => handleDeleteInvestment(investment.id)}>Delete</DeleteButton>
                          </ActionButtons>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
              </tbody>




            </StyledTable>

          </TableContainer>



        </>
      );
    }
  };

  return (
    <PRTContainer>
      <ContentContainer>
        <Header>
          <Title>Partner Expense and Investment</Title>
        </Header>
        <TabsContainer>
          <TabButton
            active={activeTab === 'PartnerExpense'}
            onClick={() => setActiveTab('PartnerExpense')}
          >
            Partner Expense
          </TabButton>
          <TabButton
            active={activeTab === 'PartnerInvestment'}
            onClick={() => setActiveTab('PartnerInvestment')}
          >
            Partner Investment
          </TabButton>
        </TabsContainer>
        {renderActiveTab()}
      </ContentContainer>
      <ToastContainer />
    </PRTContainer>
  );
};

export default PRT;
