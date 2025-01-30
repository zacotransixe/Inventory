import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFileExport, FaPlus } from 'react-icons/fa';
import Button from '../components/Button';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { deleteDoc } from 'firebase/firestore';

const Heading = styled.h1`
  font-weight: bold;
  text-align: center;
  color: #343a40;
  font-family: Aptos Display;
font-size:32px;
`;



const FullWidthGroup = styled.div`
  display: flex;
  flex-direction: column;
  grid-column: span 2; /* Occupy two columns */
  gap: 5px; /* Add space between label and input */
`;


// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #fff;
font-family: Aptos Display;
font-size:16px;
`;

const ContentContainer = styled.div`
width: 90%;
max-width:100%;
  flex-grow: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: auto;
  margin-left: 20px; /* Add space between the sidebar and content */
`;

const SearchBar = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns per row */
  gap: 20px; /* Space between fields */
  align-items: center;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  margin-bottom: 20px;

  /* Adjust for smaller screens */
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* One column for small screens */
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px; /* Space between label and input */
`;

const ButtonGroup = styled.div`
  grid-column: span 2; /* Buttons span across both columns */
  display: flex;
  justify-content: flex-end;
  gap: 15px; /* Space between buttons */
`;



const Input = styled.input`
  padding: 0.5rem;
    font-family: Aptos Display;
  font-size: 16px;
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
    font-family: Aptos Display;

  margin-bottom: 5px;
    font-size: 16px;
`;

const RightSideContainer = styled.div`
  flex-grow: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const TableWrapper = styled.div`
  width: 100%; /* Make the table wrapper take full width */
    max-width: 100%; /* Prevent the wrapper from exceeding the screen width */
  overflow-x: auto; /* Add horizontal scroll if table exceeds screen width */
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
    border: 1px solid #ddd; /* Optional border for better visibility */
  border-radius: 8px; /* Optional rounded corners */
`;

const StyledTable = styled(Table)`
  width: 100%; /* Ensure the table fits within its container */
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
`;

const StyledTableHead = styled(TableHead)`
  background-color: #343a40;
  color: #fff;

  th {
    padding: 12px;
      font-family: Aptos Display;
font-size:16px;
    text-align: left;
    color: #fff;
    position: sticky;
    top: 0;
    z-index: 1;
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
          font-family: Aptos Display;
font-size:16px;

    white-space: nowrap; /* Prevent text wrapping */
    overflow: hidden; /* Hide overflowing text */
    text-overflow: ellipsis; /* Add ellipsis for overflowing text */
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  padding: 10px 15px;
  background-color: #002985;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
font-family: Aptos Display;
font-size:16px;

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




const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchData, setSearchData] = useState({
    fromDate: '',
    toDate: '',
    truckPlateNumber: '',
    truckDriverName: '',
    truckSupplierName: '',
    customerName: '', // Add this
    cO: '', // Add this
  });

  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState(''); // Add state for user role

  const recordsPerPage = 10;

  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date.seconds ? date.seconds * 1000 : date); // Handle Firestore Timestamp
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    setLoggedIn(userData?.isLoggedIn || false);
    setUserRole(userData?.role || ''); // Assuming `role` is stored in the user data

  }, []);

  const openNewTab = () => {
    window.open('/addnewtrip', '_blank');
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({ ...prevData, [name]: value }));
  };

  const formatDate = (date) => {
    if (!date) return '01-01-1'; // Return "01-01-1" explicitly for invalid or missing dates
    const d = new Date(date.seconds ? date.seconds * 1000 : date); // Handle Firestore Timestamp or raw date
    if (isNaN(d)) return '01-01-1'; // Explicitly return "01-01-1" for invalid dates

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSearchSubmit = async () => {
    setLoading(true);

    try {
      const { fromDate, toDate, truckPlateNumber, truckDriverName, truckSupplierName, customerName } = searchData;

      // Build Firestore query
      const searchQuery = query(
        collection(db, 'trips'),
        ...(fromDate ? [where('tripDate', '>=', fromDate)] : []),
        ...(toDate ? [where('tripDate', '<=', toDate)] : []),
        ...(truckPlateNumber ? [where('truckPlateNumber', '==', truckPlateNumber)] : []),
        ...(truckDriverName ? [where('truckDriverName', '==', truckDriverName)] : []),
        ...(truckSupplierName ? [where('supplierName', '==', truckSupplierName)] : []),
        ...(customerName ? [where('customerName', '==', customerName)] : []),
        ...(searchData.cO ? [where('cO', '==', searchData.cO)] : []) // Add C/O condition
      );


      const querySnapshot = await getDocs(searchQuery);

      // Process results
      const results = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const formattedInvoiceDate = formatDate(data.invoiceDate);
        const formattedInvoiceNo = data.invoiceNo === 0 ? '0' : data.invoiceNo;

        return {
          id: doc.id,
          ...data,
          tripDate: formatDate(data.tripDate),
          invoiceDate: (formattedInvoiceDate === '01-01-1') ? '-' : formattedInvoiceDate,
          invoiceNo: (formattedInvoiceNo === '0') ? '-' : formattedInvoiceNo,
          created: formatDateTime(data.created),
        };
      });

      if (results.length === 0) {
        setSearchResults([]); // Clear table
        toast.info('No records found for the specified criteria.');
      } else {
        setSearchResults(results); // Update table with results
      }
    } catch (error) {
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };





  // Calculate the paginated data
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchResults.slice(indexOfFirstRecord, indexOfLastRecord);
  console.log(currentRecords);
  const totalPages = Math.ceil(searchResults.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleEdit = (rowData) => {
    // Pass the data to AddNewTrip page using URL parameters
    const queryParams = new URLSearchParams(rowData).toString();
    window.open(`/addnewtrip?${queryParams}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        // Delete the document from Firestore
        await deleteDoc(doc(db, 'trips', id));

        // Save log in the Logs collection
        await setDoc(doc(collection(db, "logs")), {
          tripId: id,
          deletedBy: user.uid, // Track who deleted
          deletedByEmail: user.email, // Optional: Store user's email
          deletedAt: serverTimestamp(), // Timestamp of deletion
          previousData: deletedData, // Optional: Store deleted record details
        });


        toast.success('Record deleted successfully!');

        // Remove the deleted record from the local state
        setSearchResults((prevResults) => prevResults.filter((item) => item.id !== id));
      } catch (error) {
        toast.error('Error deleting record: ' + error.message);
      }
    }
  };

  const handleExport = () => {
    if (searchResults.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Define custom headers
    const headers = [
      { label: 'Trip Date', key: 'tripDate' },
      { label: 'Truck Plate Number', key: 'truckPlateNumber' },
      { label: 'Truck Driver Name', key: 'truckDriverName' },
      { label: 'Truck Category', key: 'truckCategory' },
      { label: 'Delivery Note', key: 'deliveryNote' },
      { label: 'Customer Name', key: 'customerName' },
      { label: 'C/O', key: 'cO' },
      { label: 'Supplier Name', key: 'supplierName' },
      { label: 'First Loading', key: 'firstLoading' },
      { label: 'First Offloading', key: 'firstOffloading' },
      { label: 'Second Loading', key: 'secondLoading' },
      { label: 'Second Offloading', key: 'secondOffloading' },
      { label: 'Customer Rate', key: 'customerRate' },
      { label: 'Customer Waiting Charges', key: 'customerWaitingCharges' },
      { label: 'Amount Received', key: 'amountReceived' },
      { label: 'Amount Balance', key: 'amountBalance' },
      { label: 'Driver Rate', key: 'driverRate' },
      { label: 'Driver Waiting Charges', key: 'driverWaitingCharges' },
      { label: 'Amount Paid', key: 'amountPaid' },
      { label: 'Transaction Amount Balance', key: 'transactionAmountBalance' },
      { label: 'Invoice No', key: 'invoiceNo' },
      { label: 'Invoice Date', key: 'invoiceDate' },
      { label: 'Remarks', key: 'remarks' },
      { label: 'Created Date', key: 'created' },
    ];

    // Map search results to match custom headers
    const formattedData = searchResults.map((result) =>
      headers.reduce((acc, header) => {
        acc[header.label] = result[header.key] || ''; // Use the key to fetch the value, default to empty string if missing
        return acc;
      }, {})
    );

    // Add headers to the CSV data
    const csv = Papa.unparse(formattedData);

    // Export the CSV
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
      <ContentContainer>
        <Heading>Trip Information</Heading>

        <SearchBar>
          {/* From Date */}
          <InputGroup>
            <InputLabel>From Date</InputLabel>
            <Input
              type="date"
              name="fromDate"
              value={searchData.fromDate}
              onChange={handleSearchInputChange}
            />
          </InputGroup>

          {/* To Date */}
          <InputGroup>
            <InputLabel>To Date</InputLabel>
            <Input
              type="date"
              name="toDate"
              value={searchData.toDate}
              onChange={handleSearchInputChange}
            />
          </InputGroup>

          {/* Truck Plate Number */}
          <InputGroup>
            <InputLabel>Truck Plate Number</InputLabel>
            <Input
              type="text"
              name="truckPlateNumber"
              value={searchData.truckPlateNumber}
              onChange={handleSearchInputChange}
              placeholder="Enter Truck Plate Number"
            />
          </InputGroup>

          {/* Truck Driver Name */}
          <InputGroup>
            <InputLabel>Truck Driver Name</InputLabel>
            <Input
              type="text"
              name="truckDriverName"
              value={searchData.truckDriverName}
              onChange={handleSearchInputChange}
              placeholder="Enter Truck Driver Name"
            />
          </InputGroup>

          {/* Truck Supplier Name */}
          <InputGroup>
            <InputLabel>Truck Supplier Name</InputLabel>
            <Input
              type="text"
              name="truckSupplierName"
              value={searchData.truckSupplierName}
              onChange={handleSearchInputChange}
              placeholder="Enter Truck Supplier Name"
            />
          </InputGroup>

          {/* Customer Name */}
          <InputGroup>
            <InputLabel>Customer Name</InputLabel>
            <Input
              type="text"
              name="customerName"
              value={searchData.customerName}
              onChange={handleSearchInputChange}
              placeholder="Enter Customer Name"
            />
          </InputGroup>

          {/* C/O */}
          <InputGroup>
            <InputLabel>C/O</InputLabel>
            <Input
              type="text"
              name="cO"
              value={searchData.cO}
              onChange={handleSearchInputChange}
              placeholder="Enter C/O"
            />
          </InputGroup>

          {/* Buttons */}
          <ButtonGroup>
            <Button color="#002985" onClick={handleSearchSubmit}>
              <FaSearch /> Search
            </Button>
            {loggedIn && (
              <>
                <Button color="#002985" onClick={handleExport}>
                  <FaFileExport /> Export
                </Button>
                {userRole !== 'User' && (
                  <Button color="#28a745" onClick={openNewTab}>
                    <FaPlus /> Add New
                  </Button>
                )}
              </>
            )}
          </ButtonGroup>
        </SearchBar>





        <RightSideContainer>
          {loading ? (
            <Loader />
          ) : (
            <TableWrapper>
              {currentRecords.length > 0 && (
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
                      <TableCell>Supplier Name</TableCell>
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
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <StyledTableBody>
                    {currentRecords.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.tripDate}</TableCell>
                        <TableCell>{result.truckPlateNumber}</TableCell>
                        <TableCell>{result.truckDriverName}</TableCell>
                        <TableCell>{result.truckCategory}</TableCell>
                        <TableCell>{result.deliveryNote}</TableCell>
                        <TableCell>{result.customerName}</TableCell>
                        <TableCell>{result.cO}</TableCell>
                        <TableCell>{result.supplierName}</TableCell>
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
                        <TableCell>
                          {userRole !== 'User' && ( // Only show buttons if the role is not 'User'
                            <>
                              <button
                                style={{
                                  padding: '5px 10px',
                                  marginRight: '5px',
                                  backgroundColor: '#002985',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleEdit(result)}
                              >
                                Edit
                              </button>
                              <button
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#dc3545',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleDelete(result.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </TableCell>

                      </TableRow>
                    ))}
                  </StyledTableBody>
                </StyledTable>
              )}
            </TableWrapper>
          )}
          <PaginationControls>
            <PaginationButton onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</PaginationButton>
            <span>Page {currentPage} of {totalPages}</span>
            <PaginationButton onClick={handleNextPage} disabled={currentPage === totalPages}>Next</PaginationButton>
          </PaginationControls>
        </RightSideContainer>



        <ToastContainer />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
