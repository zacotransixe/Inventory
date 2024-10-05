import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFileExport, FaPlus } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Modal from 'react-modal';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';


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
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  align-items: center;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 100%;
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

// Add this with other styled components at the top of the file
const Select = styled.select`
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Fix table layout */
  min-width: 1500px; /* Set a minimum width for the table */

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    white-space: nowrap; /* Prevent text from wrapping */
    overflow: hidden; /* Hide overflow content */
    text-overflow: ellipsis; /* Add ellipsis for long text */
        width: 100px; /* Set fixed width of 50px for each column */
  }

  th {
    background-color: #f4f4f4;
    position: sticky;
    top: 0;
    z-index: 1;
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

const TableWrapper = styled.div`
  max-width: 100%;
  overflow-x: auto; /* Ensure the table is scrollable horizontally */
  margin-top: 20px;
`;

// Define missing components
const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
`;

const InputField = styled.div`
  flex: 1;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const SubmitButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 2s linear infinite;

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

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]); // State to store customers from Firestore
  const [searchResults, setSearchResults] = useState([]);
  const [searchData, setSearchData] = useState({
    tripDate: '',
    customer: '',
    cO: '',
    driver: '',
    truck: '',
    originLocation: '',
    destination: '',
  });


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

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Calculate the range of records to show based on current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchResults.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(searchResults.length / recordsPerPage);

  // Pagination controls
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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


  const handleSearchSubmit = async () => {
    setLoading(true);
    const searchQuery = query(
      collection(db, 'trips'),
      ...(searchData.tripDate ? [where('tripDate', '==', searchData.tripDate)] : []),
      ...(searchData.customer ? [where('customer', '==', searchData.customer)] : []),
      ...(searchData.cO ? [where('cO', '==', searchData.cO)] : []),
      ...(searchData.driver ? [where('driver', '==', searchData.driver)] : []),
      ...(searchData.truck ? [where('truck', '==', searchData.truck)] : [])
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

  return (
    <DashboardContainer>
      <Sidebar />

      <ContentContainer>
        <SearchBar>
          <Input
            type="date"
            name="tripDate"
            placeholder="Trip Date"
            value={searchData.tripDate}
            onChange={handleSearchInputChange}
          />
          <Input
            type="text"
            name="customer"
            placeholder="Customer name"
            value={searchData.customer}
            onChange={handleSearchInputChange}
          />
          <Input
            type="text"
            name="cO"
            placeholder="C/O name"
            value={searchData.cO}
            onChange={handleSearchInputChange}
          />
          <Input
            type="text"
            name="driver"
            placeholder="Driver name"
            value={searchData.driver}
            onChange={handleSearchInputChange}
          />
          <Input
            type="text"
            name="truck"
            placeholder="Truck details"
            value={searchData.truck}
            onChange={handleSearchInputChange}
          />
          <Input
            type="text"
            name="originLocation"
            placeholder="Origin location"
            value={searchData.originLocation}
            onChange={handleSearchInputChange}
          />
          <Input
            type="text"
            name="destination"
            placeholder="Destination"
            value={searchData.destination}
            onChange={handleSearchInputChange}
          />
          <ButtonGroup>
            <Button color="#17a2b8" hoverColor="#138496" onClick={handleSearchSubmit}>
              <FaSearch /> Search
            </Button>
            <Button color="#343a40" hoverColor="#23272b" onClick={handleExport}>
              <FaFileExport /> Export
            </Button>
            <Button color="#28a745" hoverColor="#218838" onClick={openModal}>
              <FaPlus /> Add New
            </Button>
          </ButtonGroup>
        </SearchBar>
        <RightSideContainer>
          <TableWrapper>
            {searchResults.length > 0 && (
              <Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Trip Date</th>
                    <th>Truck</th>
                    <th>Truck Category</th>
                    <th>Delivery Note</th>
                    <th>Driver</th>
                    <th>C/O</th>
                    <th>Customer</th>
                    <th>Loaded From</th>
                    <th>Second Loading</th>
                    <th>Uploaded To</th>
                    <th>Second Offloading</th>
                    <th>CR Rate</th>
                    <th>CR Wait</th>
                    <th>CR Rcvd Amount</th>
                    <th>CR Balance</th>
                    <th>Invoice</th>
                    <th>Invoice Date</th>
                    <th>DR Rate</th>
                    <th>DR Wait</th>
                    <th>DR Paid</th>
                    <th>DR Balance</th>
                    <th>Deductions (Advance)</th>
                    <th>Contact</th>
                    <th>Remarks</th>
                    <th>Created</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result) => (
                    <tr key={result.id}>
                      <td>{result.id}</td>
                      <td>{result.tripDate}</td>
                      <td>{result.truck}</td>
                      <td>{result.truckCategory}</td>
                      <td>{result.deliveryNote}</td>
                      <td>{result.driver}</td>
                      <td>{result.cO}</td>
                      <td>{result.customer}</td>
                      <td>{result.loadedFrom}</td>
                      <td>{result.secondLoading}</td>
                      <td>{result.uploadedTo}</td>
                      <td>{result.secondOffloading}</td>
                      <td>{result.crRate}</td>
                      <td>{result.crWait}</td>
                      <td>{result.crReceivedAmount}</td>
                      <td>{result.crBalance}</td>
                      <td>{result.invoice}</td>
                      <td>{result.invoiceDate}</td>
                      <td>{result.drRate}</td>
                      <td>{result.drWait}</td>
                      <td>{result.drPaid}</td>
                      <td>{result.drBalance}</td>
                      <td>{result.deductions}</td>
                      <td>{result.contact}</td>
                      <td>{result.remarks}</td>
                      <td>{result.created}</td>
                      <td>{result.user}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TableWrapper>
          {/* Pagination Controls */}
          <PaginationControls>
            <PaginationButton onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </PaginationButton>
            <span>Page {currentPage} of {totalPages}</span>
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



      </ContentContainer>
      <ToastContainer /> {/* Toast notification container */}
    </DashboardContainer>
  );
};

export default Dashboard;