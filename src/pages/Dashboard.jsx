import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFileExport, FaPlus } from 'react-icons/fa';
import Sidebar from '../components/Sidebar'; // Import Sidebar component
import Button from '../components/Button';   // Import Button component
import Modal from 'react-modal';
import { db } from '../firebase'; // Import Firebase config
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'; // Firebase Firestore functions
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toastify styles
import Papa from 'papaparse'; // Import papaparse


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
`;

const SearchBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Four columns */
  gap: 15px;
  align-items: center;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  width: 90%;  /* Reduce width of text fields */
  text-align: left;

  &:focus {
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  grid-column: span 4; /* Span all four columns in the last row */
`;

const RightSideContainer = styled.div`
  flex-grow: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 900px;
  margin: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Four columns layout */
  column-gap: 20px; /* Adjust the horizontal space between fields */
  row-gap: 15px; /* Adjust the vertical space between rows */
  margin-bottom: 15px;
  align-items: center;
`;

const FormLabel = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SubmitButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #218838;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #c82333;
  }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 20px;
  height: 20px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
  }
`;

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // State for loader
  const [searchResults, setSearchResults] = useState([]); // State to store the search results
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
    tripDate: "",
    truck: "",
    truckCategory: "",
    deliveryNote: "",
    driver: "",
    cO: "",
    customer: "",
    loadedFrom: "",
    uploadedTo: "",
    crRate: "",
    crWait: "",
    crReceivedAmount: "",
    drRate: "",
    drWait: "",
    drPaid: "",
    invoice: "",
    invoiceDate: "",
    deductions: "",
    remarks: "",
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle input changes for the search bar
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    try {
      await addDoc(collection(db, "trips"), formData);
      setLoading(false); // Hide loader
      toast.success("Trip data saved successfully!"); // Show success toast
      closeModal(); // Close the modal
    } catch (error) {
      setLoading(false); // Hide loader
      toast.error("Error adding document: " + error.message); // Show error toast
    }
  };

  // Handle search submission
  const handleSearchSubmit = async () => {
    setLoading(true);
    const searchQuery = query(
      collection(db, 'trips'),
      // Add your Firestore queries based on search filters
      // Use 'where' condition to filter based on the search fields
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

  // Handle export to CSV using papaparse
  const handleExport = () => {
    if (searchResults.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csv = Papa.unparse(searchResults); // Convert search results to CSV format

    // Create a Blob and trigger a download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'trip_data.csv'); // Filename for the downloaded file
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
          {/* Display search results */}
          {searchResults.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <th>Trip Date</th>
                  <th>Customer</th>
                  <th>C/O</th>
                  <th>Driver</th>
                  <th>Truck</th>
                  <th>Origin Location</th>
                  <th>Destination</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.tripDate}</td>
                    <td>{result.customer}</td>
                    <td>{result.cO}</td>
                    <td>{result.driver}</td>
                    <td>{result.truck}</td>
                    <td>{result.loadedFrom}</td>
                    <td>{result.uploadedTo}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </RightSideContainer>

        {/* Single Modal without nesting */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Add New Trip"
          ariaHideApp={false}  // Ensure this prevents multiple modal rendering issues
          shouldCloseOnOverlayClick={true} // Close the modal when clicking outside it
        >
          <h2>Add New Trip</h2>
          <ModalForm onSubmit={handleSubmit}>
            <FormGroup>
              <InputField>
                <FormLabel>Trip Date:</FormLabel>
                <Input
                  type="date"
                  name="tripDate"
                  value={formData.tripDate}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>Truck:</FormLabel>
                <Input
                  type="text"
                  name="truck"
                  value={formData.truck}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>Truck Category:</FormLabel>
                <Input
                  type="text"
                  name="truckCategory"
                  value={formData.truckCategory}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>Delivery Note:</FormLabel>
                <Input
                  type="text"
                  name="deliveryNote"
                  value={formData.deliveryNote}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
            </FormGroup>

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
                <Input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                />
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

            <FormGroup>
              <InputField>
                <FormLabel>Uploaded To:</FormLabel>
                <Input
                  type="text"
                  name="uploadedTo"
                  value={formData.uploadedTo}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
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
            </FormGroup>

            <FormGroup>
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
              <InputField>
                <FormLabel>DR Wait:</FormLabel>
                <Input
                  type="number"
                  name="drWait"
                  value={formData.drWait}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
              <InputField>
                <FormLabel>DR Paid:</FormLabel>
                <Input
                  type="number"
                  name="drPaid"
                  value={formData.drPaid}
                  onChange={handleInputChange}
                  required
                />
              </InputField>
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
            </FormGroup>

            <FormGroup>
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

            <SubmitButtonGroup>
              {loading ? <Loader /> : <SaveButton type="submit">Save</SaveButton>}
              <CancelButton type="button" onClick={closeModal}>
                Cancel
              </CancelButton>
            </SubmitButtonGroup>
          </ModalForm>
        </Modal>
      </ContentContainer>
      <ToastContainer /> {/* Toast notification container */}
    </DashboardContainer>
  );
};

export default Dashboard;
