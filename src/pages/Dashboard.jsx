import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFileExport, FaPlus, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Modal from 'react-modal';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Timestamp } from 'firebase/firestore';

// Styled Components
const DashboardContainer = styled.div`
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
  max-width: 1200px;
  margin: auto;
  margin-left: 20px; /* Add space between the sidebar and content */
`;


const SearchBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 15px;
  align-items: center;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 100%;
  &:focus {
    border-color: #007bff;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const Select = styled.select`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 100%;
  background-color: #fff;
  &:focus {
    border-color: #007bff;
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  grid-column: span 4;
`;

const RightSideContainer = styled.div`
  flex-grow: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const TableWrapper = styled.div`
  height: 400px; /* Set a fixed height for the table */
  max-width: 900px; /* Set a fixed width for the table */
  overflow: auto; /* Enable both horizontal and vertical scrolling */
  border: 1px solid #ddd; /* Optional border around the table */
  margin-top: 20px;
  margin-left: auto; /* Center align the table */
  margin-right: auto;
`;

const StyledTable = styled(Table)`
  border-collapse: collapse;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const StyledTableHead = styled(TableHead)`
  background-color: #343a40;
  color: #fff;
  th {
    padding: 12px;
    text-align: left;
    color: #fff;
    font-weight: bold;
    position: sticky; /* Make header sticky */
    top: 0; /* Stick the header to the top of the scrollable container */
    z-index: 1; /* Ensure header stays above the rows */
  }
`;

const StyledTableBody = styled(TableBody)`
  tr {
    &:nth-of-type(even) {
      background-color: #f9f9f9;
    }
    &:hover {
      background-color: #f1f1f1;
    }
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    text-align: left;
    white-space: nowrap; /* Prevent text wrapping */
    overflow: hidden; /* Hide overflowing text */
    text-overflow: ellipsis; /* Add ellipsis to overflowing text */
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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

const SectionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const SubmitButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const FormLabel = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    color: #dc3545;
  }
`;

const SidebarContainer = styled.div`
  width: 250px; /* Set a fixed width for the sidebar */
  flex-shrink: 0; /* Prevent the sidebar from shrinking */
  background-color: #343a40; /* Example background color */
  color: #fff;
  height: 100vh; /* Full viewport height */
`;


const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchData, setSearchData] = useState({ fromDate: '', toDate: '' });
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const initialFormData = {
    slNo: '',
    tripDate: '',
    truckPlateNumber: '',
    truckDriverName: '',
    truckCategory: '',
    deliveryNote: '',
    customerName: '',
    cO: '',
    firstLoading: '',
    firstOffloading: '',
    secondLoading: '',
    secondOffloading: '',
    customerRate: '',
    customerWaitingCharges: '',
    amountReceived: '',
    amountBalance: '',
    driverRate: '',
    driverWaitingCharges: '',
    amountPaid: '',
    transactionAmountBalance: '',
    invoiceNo: '',
    invoiceDate: '',
    remarks: '',
  };

  const [formData, setFormData] = useState({
    slNo: '',
    tripDate: '',
    truckPlateNumber: '',
    truckDriverName: '',
    truckCategory: '',
    deliveryNote: '',
    customerName: '',
    cO: '',
    firstLoading: '',
    firstOffloading: '',
    secondLoading: '',
    secondOffloading: '',
    customerRate: '',
    customerWaitingCharges: '',
    amountReceived: '',
    amountBalance: '',
    driverRate: '',
    driverWaitingCharges: '',
    amountPaid: '',
    transactionAmountBalance: '',
    invoiceNo: '',
    invoiceDate: '',
    remarks: '',
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    setLoggedIn(userData?.isLoggedIn || false);
  }, []);

  // const openModal = () => {
  //   setFormData(initialFormData); // Clear all fields by resetting to initial state
  //   setIsModalOpen(true);
  //};
  const openNewTab = () => {
    window.open('/addnewtrip', '_blank');
  };
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add form data to Firebase with a unique ID
      const docRef = await addDoc(collection(db, 'trips'), {
        ...formData,
        created: new Date().toISOString(), // Record creation date
      });

      // Log the unique document ID (can be removed if not needed)
      console.log("Document written with ID: ", docRef.id);

      // Display a success message
      toast.success('Trip data saved successfully!');

      // Reset form fields
      setFormData(initialFormData);

      // Close modal after saving
      closeModal();
    } catch (error) {
      // Display an error message if saving fails
      setLoading(false);
      toast.error('Error saving trip data: ' + error.message);
    }
    setLoading(false);
  };


  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSearchSubmit = async () => {
    setLoading(true);
  
    try {
      // Check and format dates if necessary
      const formatDate = (date) => {
        if (date.includes('-')) {
          const parts = date.split('-');
          if (parts[0].length === 4) {
            // Already in YYYY-MM-DD format
            return date;
          } else {
            // Convert from DD-MM-YYYY to YYYY-MM-DD
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
          }
        }
        return date;
      };
  
      const fromDate = searchData.fromDate ? formatDate(searchData.fromDate) : null;
      const toDate = searchData.toDate ? formatDate(searchData.toDate) : null;
  
      console.log('Formatted From Date:', fromDate);
      console.log('Formatted To Date:', toDate);
  
      // Build the Firestore query
      const searchQuery = query(
        collection(db, 'trips'),
        ...(fromDate ? [where('tripDate', '>=', fromDate)] : []),
        ...(toDate ? [where('tripDate', '<=', toDate)] : [])
      );
  
      const querySnapshot = await getDocs(searchQuery);
  
      // Process results
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      if (results.length === 0) {
        toast.info('No records found for the specified date range.');
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleExport = () => {
    if (searchResults.length === 0) {
      toast.error('No data to export');
      return;
    }
    const csv = Papa.unparse(searchResults);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'trip_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardContainer>
      <SidebarContainer>
    <Sidebar />
  </SidebarContainer>

      <ContentContainer>
        <SearchBar>
          <InputWrapper>
            <InputLabel>Start Date</InputLabel>
            <Input type="date" name="fromDate" value={searchData.fromDate} onChange={handleSearchInputChange} />
          </InputWrapper>
          <InputWrapper>
            <InputLabel>End Date</InputLabel>
            <Input type="date" name="toDate" value={searchData.toDate} onChange={handleSearchInputChange} />
          </InputWrapper>
          <ButtonGroup>
            <Button color="#17a2b8" onClick={handleSearchSubmit}><FaSearch /> Search</Button>
            {loggedIn && (
              <>
                <Button color="#343a40" onClick={handleExport}><FaFileExport /> Export</Button>
                <Button color="#28a745" onClick={openNewTab}><FaPlus /> Add New</Button>
              </>
            )}
          </ButtonGroup>
        </SearchBar>

        <RightSideContainer>
          {loading ? (
            <Loader />
          ) : (
            <TableWrapper>
              {searchResults.length > 0 && (
                <StyledTable>
                  <StyledTableHead>
                    <TableRow>
                      <TableCell>Trip Date</TableCell>
                      <TableCell>Truck Plate Number</TableCell>
                      <TableCell>Truck Driver Name</TableCell>
                      <TableCell>Truck Category</TableCell>
                      <TableCell>Delivery Note</TableCell>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>C/O</TableCell>
                      <TableCell>First Loading</TableCell>
                      <TableCell>First Offloading</TableCell>
                      <TableCell>Second Loading</TableCell>
                      <TableCell>Second Offloading</TableCell>
                      <TableCell>Customer Rate</TableCell>
                      <TableCell>Customer Waiting Charges</TableCell>
                      <TableCell>Amount Received</TableCell>
                      <TableCell>Amount Balance</TableCell>
                      <TableCell>Driver Rate</TableCell>
                      <TableCell>Driver Waiting Charges</TableCell>
                      <TableCell>Amount Paid</TableCell>
                      <TableCell>Amount Balance</TableCell>
                      <TableCell>Invoice No</TableCell>
                      <TableCell>Invoice Date</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>User</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <StyledTableBody>
                    {searchResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.tripDate}</TableCell>
                        <TableCell>{result.truckPlateNumber}</TableCell>
                        <TableCell>{result.truckDriverName}</TableCell>
                        <TableCell>{result.truckCategory}</TableCell>
                        <TableCell>{result.deliveryNote}</TableCell>
                        <TableCell>{result.customerName}</TableCell>
                        <TableCell>{result.cO}</TableCell>
                        <TableCell>{result.firstLoading}</TableCell>
                        <TableCell>{result.firstOffloading}</TableCell>
                        <TableCell>{result.secondLoading}</TableCell>
                        <TableCell>{result.secondOffloading}</TableCell>
                        <TableCell>{result.customerRate}</TableCell>
                        <TableCell>{result.customerWaitingCharges}</TableCell>
                        <TableCell>{result.amountReceived}</TableCell>
                        <TableCell>{result.amountBalance}</TableCell>
                        <TableCell>{result.driverRate}</TableCell>
                        <TableCell>{result.driverWaitingCharges}</TableCell>
                        <TableCell>{result.amountPaid}</TableCell>
                        <TableCell>{result.transactionAmountBalance}</TableCell>
                        <TableCell>{result.invoiceNo}</TableCell>
                        <TableCell>{result.invoiceDate}</TableCell>
                        <TableCell>{result.remarks}</TableCell>
                        <TableCell>{result.created}</TableCell>
                      </TableRow>
                    ))}
                  </StyledTableBody>
                </StyledTable>
              )}
            </TableWrapper>
          )}
          <PaginationControls>
            <PaginationButton onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</PaginationButton>
            <span>Page {currentPage}</span>
            <PaginationButton onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === Math.ceil(searchResults.length / recordsPerPage)}>Next</PaginationButton>
          </PaginationControls>
        </RightSideContainer>

        

        <ToastContainer />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
