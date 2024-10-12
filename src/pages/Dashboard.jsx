import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFileExport, FaPlus } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Modal from 'react-modal';
import { db, auth } from '../firebase'; // Add auth from firebase
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';


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
  margin-bottom: 20px; /* Add margin at the bottom */
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 100%;
  text-align: left;

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


// Add this with other styled components at the top of the file
const Select = styled.select`
padding: 0.5rem;
font - size: 14px;
border: 1px solid #ccc;
border - radius: 5px;
outline: none;
width: 100 %;
text - align: left;

  &:focus {
  border - color: #007bff;
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
  grid-column: span 4 ; /* Adjust to match the new layout */
`;

const RightSideContainer = styled.div`
  flex-grow: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const TableWrapper = styled.div`
  max-width: 100%;
  overflow-x: auto; /* Ensure the table is scrollable horizontally */
  margin-top: 20px;
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
    position: sticky;
    top: 0;
    z-index: 2;
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

// Define missing components
const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: auto;
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

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchData, setSearchData] = useState({
    fromDate: '',
    toDate: '',
  });
  const [loggedIn, setLoggedIn] = useState(false); // State for login status

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Check for authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    const formDataWithMetadata = {
      ...formData,
      created: new Date().toISOString(), // Add current date/time
    };

    try {
      await addDoc(collection(db, 'trips'), formDataWithMetadata);
      setLoading(false);
      toast.success('Trip data saved successfully!');
      closeModal();
    } catch (error) {
      setLoading(false);
      toast.error('Error adding document: ' + error.message);
    }
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSearchSubmit = async () => {
    setLoading(true);
    const searchQuery = query(
      collection(db, 'trips'),
      ...(searchData.fromDate ? [where('tripDate', '>=', searchData.fromDate)] : []),
      ...(searchData.toDate ? [where('tripDate', '<=', searchData.toDate)] : [])
    );

    try {
      const querySnapshot = await getDocs(searchQuery);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSearchResults(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error fetching data: ' + error.message);
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
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'trip_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [formData, setFormData] = useState({
    tripDate: '',
    truck: '',
    truckCategory: '',
    deliveryNote: '',
    driver: '',
    cO: '',
    customer: '',
    loadedFrom: '',
    uploadedTo: '',
    crRate: '',
    crWait: '',
    crReceivedAmount: '',
    drRate: '',
    drWait: '',
    drPaid: '',
    invoice: '',
    invoiceDate: '',
    deductions: '',
    remarks: '',
  });

  // Define missing styled components
  const FormGroup = styled.div`
display: flex;
flex-direction: column;
margin-bottom: 15px;
`;

  const InputField = styled.div`
margin-bottom: 10px;
`;

  const FormLabel = styled.label`
font-weight: bold;
margin-bottom: 5px;
`;

  const SubmitButtonGroup = styled.div`
display: flex;
justify-content: flex-end;
gap: 10px;
`;

  // Fetch customers from Firestore when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchCustomers = async () => {
        try {
          const customersCollection = collection(db, 'customers');
          const customersSnapshot = await getDocs(customersCollection);
          const customersList = customersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCustomers(customersList);
        } catch (error) {
          console.error('Error fetching customers: ', error);
        }
      };

      fetchCustomers();
    }
  }, [isModalOpen]);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchResults.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(searchResults.length / recordsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <DashboardContainer>
      <Sidebar />

      <ContentContainer>
        <SearchBar>
          <InputWrapper>
            <InputLabel>Start Date</InputLabel>

            <Input
              type="date"
              name="fromDate"
              placeholder="From Date"
              value={searchData.fromDate}
              onChange={handleSearchInputChange}
            />
          </InputWrapper>
          <InputWrapper>
            <InputLabel>End Date</InputLabel>
            <Input
              type="date"
              name="toDate"
              placeholder="To Date"
              value={searchData.toDate}
              onChange={handleSearchInputChange}
            />
          </InputWrapper>
          <ButtonGroup>
            <Button color="#17a2b8" hoverColor="#138496" onClick={handleSearchSubmit}>
              <FaSearch /> Search
            </Button>
            {loggedIn && (<Button color="#343a40" hoverColor="#23272b" onClick={handleExport}>
              <FaFileExport /> Export
            </Button>)}
            {loggedIn && (
              <Button color="#28a745" hoverColor="#218838" onClick={openModal}>
                <FaPlus /> Add New
              </Button>
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
                      <TableCell>Truck</TableCell>
                      <TableCell>Truck Category</TableCell>
                      <TableCell>Delivery Note</TableCell>
                      <TableCell>Driver</TableCell>
                      <TableCell>C/O</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Loaded From</TableCell>
                      <TableCell>Second Loading</TableCell>
                      <TableCell>Uploaded To</TableCell>
                      <TableCell>Second Offloading</TableCell>
                      <TableCell>CR Rate</TableCell>
                      <TableCell>CR Wait</TableCell>
                      <TableCell>CR Rcvd Amount</TableCell>
                      <TableCell>CR Balance</TableCell>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Invoice Date</TableCell>
                      <TableCell>DR Rate</TableCell>
                      <TableCell>DR Wait</TableCell>
                      <TableCell>DR Paid</TableCell>
                      <TableCell>DR Balance</TableCell>
                      <TableCell>Deductions (Advance)</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>User</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <StyledTableBody>
                    {searchResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.tripDate}</TableCell>
                        <TableCell>{result.truck}</TableCell>
                        <TableCell>{result.truckCategory}</TableCell>
                        <TableCell>{result.deliveryNote}</TableCell>
                        <TableCell>{result.driver}</TableCell>
                        <TableCell>{result.cO}</TableCell>
                        <TableCell>{result.customer}</TableCell>
                        <TableCell>{result.loadedFrom}</TableCell>
                        <TableCell>{result.secondLoading}</TableCell>
                        <TableCell>{result.uploadedTo}</TableCell>
                        <TableCell>{result.secondOffloading}</TableCell>
                        <TableCell>{result.crRate}</TableCell>
                        <TableCell>{result.crWait}</TableCell>
                        <TableCell>{result.crReceivedAmount}</TableCell>
                        <TableCell>{result.crBalance}</TableCell>
                        <TableCell>{result.invoice}</TableCell>
                        <TableCell>{result.invoiceDate}</TableCell>
                        <TableCell>{result.drRate}</TableCell>
                        <TableCell>{result.drWait}</TableCell>
                        <TableCell>{result.drPaid}</TableCell>
                        <TableCell>{result.drBalance}</TableCell>
                        <TableCell>{result.deductions}</TableCell>
                        <TableCell>{result.contact}</TableCell>
                        <TableCell>{result.remarks}</TableCell>
                        <TableCell>{result.created}</TableCell>
                        <TableCell>{result.user}</TableCell>
                      </TableRow>
                    ))}
                  </StyledTableBody>
                </StyledTable>
              )}
            </TableWrapper>
          )}

          {/* Pagination Controls */}
          <PaginationControls>
            <PaginationButton onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </PaginationButton>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <PaginationButton onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </PaginationButton>
          </PaginationControls>


        </RightSideContainer>


        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Add New Trip"
          ariaHideApp={false}
          shouldCloseOnOverlayClick={true}
          style={{
            overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
            content: { borderRadius: '15px', padding: '20px', maxWidth: '900px', margin: 'auto' },
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Add New Trip</h2>
          <ModalForm onSubmit={handleSubmit}>

            {/* Truck Information Section */}
            <h3 style={{ margin: '15px 0' }}>Truck Information</h3>
            {/* Trip Information */}
            <h3>Trip Information</h3>
            <FormGroup>
              <InputField>
                <FormLabel>Trip Date:</FormLabel>
                <Input type="date" name="tripDate" value={formData.tripDate} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Truck:</FormLabel>
                <Input type="text" name="truck" value={formData.truck} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Truck Category:</FormLabel>
                <Input type="text" name="truckCategory" value={formData.truckCategory} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Delivery Note:</FormLabel>
                <Input type="text" name="deliveryNote" value={formData.deliveryNote} onChange={handleInputChange} required />
              </InputField>
            </FormGroup>

            {/* Driver and Customer Information */}
            <h3>Driver & Customer Information</h3>
            <FormGroup>
              <InputField>
                <FormLabel>Driver:</FormLabel>
                <Input type="text" name="driver" value={formData.driver} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>C/O:</FormLabel>
                <Input type="text" name="cO" value={formData.cO} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Customer:</FormLabel>
                <Input type="text" name="customer" value={formData.customer} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Loaded From:</FormLabel>
                <Input type="text" name="loadedFrom" value={formData.loadedFrom} onChange={handleInputChange} required />
              </InputField>
            </FormGroup>

            {/* Second Loading and Offloading Information */}
            <h3>Second Loading & Offloading</h3>
            <FormGroup>
              <InputField>
                <FormLabel>Second Loading:</FormLabel>
                <Input type="text" name="secondLoading" value={formData.secondLoading} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Uploaded To:</FormLabel>
                <Input type="text" name="uploadedTo" value={formData.uploadedTo} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Second Offloading:</FormLabel>
                <Input type="text" name="secondOffloading" value={formData.secondOffloading} onChange={handleInputChange} required />
              </InputField>
            </FormGroup>

            {/* Rate and Payment Details */}
            <h3>Rate & Payment Information</h3>
            <FormGroup>
              <InputField>
                <FormLabel>CR Rate:</FormLabel>
                <Input type="number" name="crRate" value={formData.crRate} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>CR Wait:</FormLabel>
                <Input type="number" name="crWait" value={formData.crWait} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>CR Received Amount:</FormLabel>
                <Input type="number" name="crReceivedAmount" value={formData.crReceivedAmount} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>CR Balance:</FormLabel>
                <Input type="number" name="crBalance" value={formData.crBalance} onChange={handleInputChange} required />
              </InputField>
            </FormGroup>

            <h3>Invoice Information</h3>
            <FormGroup>
              <InputField>
                <FormLabel>Invoice:</FormLabel>
                <Input type="text" name="invoice" value={formData.invoice} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Invoice Date:</FormLabel>
                <Input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} required />
              </InputField>
            </FormGroup>

            {/* Final Fields */}
            <FormGroup>
              <InputField>
                <FormLabel>DR Rate:</FormLabel>
                <Input type="number" name="drRate" value={formData.drRate} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>DR Wait:</FormLabel>
                <Input type="number" name="drWait" value={formData.drWait} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>DR Paid:</FormLabel>
                <Input type="number" name="drPaid" value={formData.drPaid} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Deductions (Advance):</FormLabel>
                <Input type="number" name="deductions" value={formData.deductions} onChange={handleInputChange} required />
              </InputField>
              <InputField>
                <FormLabel>Contact:</FormLabel>
                <Input type="text" name="contact" value={formData.contact} onChange={handleInputChange} required />
              </InputField>
            </FormGroup>

            {/* Remarks */}
            <FormGroup>
              <InputField>
                <FormLabel>Remarks:</FormLabel>
                <Input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} />
              </InputField>
            </FormGroup>

            {/* Driver and Customer Information */}
            <h3 style={{ margin: '15px 0' }}>Driver & Customer Details</h3>
            <FormGroup>
              <InputField>
                <FormLabel>Driver:</FormLabel>
                <Input
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>C/O:</FormLabel>
                <Input
                  type="text"
                  name="cO"
                  value={formData.cO}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>Customer:</FormLabel>
                <Select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </InputField>
              <InputField>
                <FormLabel>Loaded From:</FormLabel>
                <Input
                  type="text"
                  name="loadedFrom"
                  value={formData.loadedFrom}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
            </FormGroup>

            {/* Rate and Payment Details */}
            <h3 style={{ margin: '15px 0' }}>Rate & Payment Details</h3>
            <FormGroup>
              <InputField>
                <FormLabel>CR Rate:</FormLabel>
                <Input
                  type="number"
                  name="crRate"
                  value={formData.crRate}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>CR Wait:</FormLabel>
                <Input
                  type="number"
                  name="crWait"
                  value={formData.crWait}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>CR Received Amount:</FormLabel>
                <Input
                  type="number"
                  name="crReceivedAmount"
                  value={formData.crReceivedAmount}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>DR Rate:</FormLabel>
                <Input
                  type="number"
                  name="drRate"
                  value={formData.drRate}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
            </FormGroup>

            {/* Invoice & Remarks Section */}
            <h3 style={{ margin: '15px 0' }}>Invoice & Additional Details</h3>
            <FormGroup>
              <InputField>
                <FormLabel>Invoice:</FormLabel>
                <Input
                  type="text"
                  name="invoice"
                  value={formData.invoice}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>Invoice Date:</FormLabel>
                <Input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>Deductions (Advance):</FormLabel>
                <Input
                  type="number"
                  name="deductions"
                  value={formData.deductions}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>Remarks:</FormLabel>
                <Input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                />
              </InputField>
            </FormGroup>

            {/* Hidden Fields: Created and User */}
            <input
              type="hidden"
              name="created"
              value={new Date().toISOString()} // Automatically set the current date/time
            />


            {/* Submit & Cancel Buttons */}
            <SubmitButtonGroup>
              {loading ? <Loader /> : <SaveButton type="submit">Save</SaveButton>}
              <CancelButton type="button" onClick={closeModal}>Cancel</CancelButton>
            </SubmitButtonGroup>
          </ModalForm>
        </Modal>

        <ToastContainer />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
