import React, { useState } from 'react';
import styled from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

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



const AddNewTripContainer = styled.div`
  max-width: 800px;
  margin: auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const AddNewTrip = () => {
    const [formData, setFormData] = useState({
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'trips'), {
                ...formData,
                created: new Date().toISOString(),
            });
            toast.success('Trip data saved successfully!');
            setFormData({
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
        } catch (error) {
            toast.error('Error saving trip data: ' + error.message);
        }
    };

    return (
        <AddNewTripContainer>

            <form onSubmit={handleSubmit}>
                <h2 style={{ textAlign: 'center' }}>Add New Trip</h2>

                <h3>Trip Information</h3>
                <InputWrapper>
                    <FormLabel>Date:</FormLabel>
                    <Input type="date" name="tripDate" value={formData.tripDate} onChange={handleInputChange} required />
                </InputWrapper>

                <h3>Truck Info</h3>
                <SectionContainer>
                    <div>
                        <Label>Truck Plate Number:</Label>
                        <Input
                            type="text"
                            name="truckPlateNumber"
                            value={formData.truckPlateNumber}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Truck Driver Name:</Label>
                        <Input
                            type="text"
                            name="truckDriverName"
                            value={formData.truckDriverName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Truck Category:</Label>
                        <Input
                            type="text"
                            name="truckCategory"
                            value={formData.truckCategory}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Delivery Note:</Label>
                        <Select
                            name="deliveryNote"
                            value={formData.deliveryNote}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Status</option>
                            <option value="Received">Received</option>
                            <option value="Not Received">Not Received</option>
                        </Select>
                    </div>
                </SectionContainer>

                <h3>Customer Info</h3>
                <SectionContainer>
                    <div>
                        <Label>Customer Name:</Label>
                        <Input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>C/O:</Label>
                        <Input
                            type="text"
                            name="cO"
                            value={formData.cO}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </SectionContainer>


                <h3>Loading and Offloading Details</h3>
                <SectionContainer>
                    <div>
                        <Label>First Loading:</Label>
                        <Input
                            type="text"
                            name="firstLoading"
                            value={formData.firstLoading}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>First Offloading:</Label>
                        <Input
                            type="text"
                            name="firstOffloading"
                            value={formData.firstOffloading}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Second Loading (Optional):</Label>
                        <Input
                            type="text"
                            name="secondLoading"
                            value={formData.secondLoading}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label>Second Offloading (Optional):</Label>
                        <Input
                            type="text"
                            name="secondOffloading"
                            value={formData.secondOffloading}
                            onChange={handleInputChange}
                        />
                    </div>
                </SectionContainer>


                <h3>Transaction Details</h3>
                <SectionContainer>
                    <div>
                        <Label>Customer Rate:</Label>
                        <Input
                            type="number"
                            name="customerRate"
                            value={formData.customerRate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Customer Waiting Charges:</Label>
                        <Input
                            type="number"
                            name="customerWaitingCharges"
                            value={formData.customerWaitingCharges}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Amount Received:</Label>
                        <Input
                            type="number"
                            name="amountReceived"
                            value={formData.amountReceived}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Amount Balance:</Label>
                        <Input
                            type="number"
                            name="amountBalance"
                            value={formData.amountBalance}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Driver Rate:</Label>
                        <Input
                            type="number"
                            name="driverRate"
                            value={formData.driverRate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Driver Waiting Charges:</Label>
                        <Input
                            type="number"
                            name="driverWaitingCharges"
                            value={formData.driverWaitingCharges}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Amount Paid:</Label>
                        <Input
                            type="number"
                            name="amountPaid"
                            value={formData.amountPaid}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Amount Balance:</Label>
                        <Input
                            type="number"
                            name="transactionAmountBalance"
                            value={formData.transactionAmountBalance}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </SectionContainer>

                <h3>Invoice Details</h3>
                <SectionContainer>
                    <div>
                        <Label>Invoice No:</Label>
                        <Input
                            type="text"
                            name="invoiceNo"
                            value={formData.invoiceNo}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>Invoice Date:</Label>
                        <Input
                            type="date"
                            name="invoiceDate"
                            value={formData.invoiceDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </SectionContainer>

                <h3>Remarks</h3>
                <SectionContainer style={{ gridTemplateColumns: '1fr' }}>
                    <div>
                        <Input
                            type="text"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                        />
                    </div>
                </SectionContainer>

                {/* Add form fields here, similar to the modal */}
                <button type="submit">Save</button>
            </form>
            <ToastContainer />
        </AddNewTripContainer>
    );
};

export default AddNewTrip;
