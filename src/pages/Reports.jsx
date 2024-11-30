import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReportsContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DateInput = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 0 10px;
`;

const SearchButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const TableContainer = styled.div`
  margin-top: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #007bff;
    color: white;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const Loader = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const SmallTableContainer = styled.div`
  width: 40%; /* Occupy 30% of the width */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const LargeTableContainer = styled.div`
  width: 50%; /* Occupy the remaining space */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SmallTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const SmallTableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  background-color: #007bff;
  color: white;
`;

const SmallTableCell = styled.td`
  padding: 0.75rem;
  text-align: left;
  font-size: 0.9rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
`;

const HeaderTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

const TableWrapper = styled.div`
  display: flex;
  justify-content: space-between; /* Ensure tables align side by side */
  gap: 20px; /* Add space between the two tables */
`;

const LargeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const LargeTableHead = styled.thead`
  background-color: #007bff;
  color: #fff;
`;

const LargeTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }

  &:hover {
    background-color: #e9ecef;
  }
`;

const LargeTableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 1rem;
`;

const LargeTableCell = styled.td`
  padding: 0.75rem;
  text-align: left;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #ddd;
`;

const MonthlyExpensesTableContainer = styled.div`
  width: 20%; /* Adjust width as needed */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const MonthlyExpensesTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #007bff;
    color: white;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [monthWiseData, setMonthWiseData] = useState([]);
  const [customerDriverSummary, setCustomerDriverTotals] = useState([]);
  const [customerWiseReport, setCustomerWiseReport] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [loadToOffloadReport, setLoadToOffloadReport] = useState([]);

  const fetchReports = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both From Date and To Date.');
      return;
    }

    setLoading(true);

    try {
      // Convert dates to timestamps for querying


      // Fetch Trips Data
      const tripsQuery = query(
        collection(db, 'trips'),
        where('tripDate', '>=', fromDate),
        where('tripDate', '<=', toDate)
      )


      const tripsSnapshot = await getDocs(tripsQuery);

      const tripsData = tripsSnapshot.docs.map((doc) => doc.data());

      console.log(fromDate, toDate);
      // Fetch Expenses Data
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '>=', fromDate),
        where('date', '<=', toDate)
      );
      const expensesSnapshot = await getDocs(expensesQuery);

      const expensesData = expensesSnapshot.docs.map((doc) => doc.data());

      // Generate Month-Wise Summary
      const monthSummary = generateMonthSummary(tripsData, expensesData);
      setMonthWiseData(monthSummary);

      // Generate Customer and Driver Totals
      const customerDriverSummary = generateCustomerDriverSummary(tripsData);
      setCustomerDriverTotals(customerDriverSummary);

      // Generate Customer-Wise Report
      const customerReport = generateCustomerWiseReport(tripsData);
      setCustomerWiseReport(customerReport);

      // Generate Monthly Expenses
      const monthlyExpenseReport = generateMonthlyExpenses(expensesData);
      setMonthlyExpenses(monthlyExpenseReport);

      // Generate LoadTo and UploadTo Report
      const loadToOffload = generateLoadToOffloadReport(tripsData);
      setLoadToOffloadReport(loadToOffload);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error fetching reports: ' + error.message);
    }
  };

  const generateMonthSummary = (trips, expenses) => {
    console.log('Trips data:', trips);

    const summary = {};



    // Process trips
    trips.forEach((trip) => {
      const tripDate = new Date(trip.tripDate);
      const monthYear = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;

      const year = tripDate.getFullYear();
      const month = String(tripDate.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;


      if (!summary[key]) {
        summary[key] = {
          year, // Add year as a separate field
          month, // Add month as a separate field
          trips: 0,
          customerRate: 0,
          customerWait: 0,
          customerTotal: 0,
          driverRate: 0,
          driverWait: 0,
          driverTotal: 0,
          expenses: 0,
        };
      }

      summary[monthYear].trips += 1; // Increment trip count
      summary[monthYear].customerRate += parseFloat(trip.customerRate || 0); // Add customer rate
      summary[monthYear].customerWait += parseFloat(trip.customerWaitingCharges || 0); // Add customer waiting charges
      summary[monthYear].driverRate += parseFloat(trip.driverRate || 0); // Add driver rate
      summary[monthYear].driverWait += parseFloat(trip.driverWaitingCharges || 0); // Add driver waiting charges

      // Calculate totals
      summary[monthYear].customerTotal = summary[monthYear].customerRate + summary[monthYear].customerWait;
      summary[monthYear].driverTotal = summary[monthYear].driverRate + summary[monthYear].driverWait;
    });

    // Process expenses
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const monthYear = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

      if (!summary[monthYear]) {
        summary[monthYear] = {
          month: monthYear,
          trips: 0,
          customerRate: 0,
          customerWait: 0,
          customerTotal: 0,
          driverRate: 0,
          driverWait: 0,
          driverTotal: 0,
          expenses: 0,
        };
      }

      summary[monthYear].expenses += parseFloat(expense.amount || 0); // Add expense amount
    });

    // Convert the summary object into an array
    return Object.values(summary).sort((a, b) => new Date(a.month) - new Date(b.month));
  };


  const generateCustomerDriverSummary = (trips) => {
    console.log('Trips : ', trips);
    if (!trips || trips.length === 0) {
      // Return default values if there are no trips
      return {
        customer: {
          description: "Customer",
          rate: "0.00",
          wait: "0.00",
          total: "0.00",
          paid: "0.00",
          balance: "0.00",
          trips: 0,
        },
        driver: {
          description: "Driver",
          rate: "0.00",
          wait: "0.00",
          total: "0.00",
          paid: "0.00",
          balance: "0.00",
          trips: 0,
        },
      };
    }

    let customerRate = 0;
    let customerWait = 0;
    let customerPaid = 0;
    let customerBalance = 0;
    let driverRate = 0;
    let driverWait = 0;
    let driverPaid = 0;
    let driverBalance = 0;
    let totalTrips = 0;

    trips.forEach((trip) => {
      customerRate += parseFloat(trip.customerRate || 0);
      customerWait += parseFloat(trip.customerWaitingCharges || 0);
      customerPaid += parseFloat(trip.amountReceived || 0);
      customerBalance += parseFloat(trip.amountBalance || 0);

      driverRate += parseFloat(trip.driverRate || 0);
      driverWait += parseFloat(trip.driverWaitingCharges || 0);
      driverPaid += parseFloat(trip.amountPaid || 0);
      driverBalance += parseFloat(trip.amountBalance1 || 0);

      totalTrips += 1; // Increment trip count
    });

    return {
      customer: {
        description: "Customer",
        rate: customerRate.toFixed(2),
        wait: customerWait.toFixed(2),
        total: (customerRate + customerWait).toFixed(2),
        paid: customerPaid.toFixed(2),
        balance: customerBalance.toFixed(2),
        trips: totalTrips,
      },
      driver: {
        description: "Driver",
        rate: driverRate.toFixed(2),
        wait: driverWait.toFixed(2),
        total: (driverRate + driverWait).toFixed(2),
        paid: driverPaid.toFixed(2),
        balance: driverBalance.toFixed(2),
        trips: totalTrips,
      },
    };
  };



  const generateCustomerWiseReport = (trips) => {
    const customerSummary = {};

    trips.forEach((trip) => {
      const customerName = trip.customerName || 'Unknown';

      if (!customerSummary[customerName]) {
        customerSummary[customerName] = {
          customer: customerName,
          trips: 0,
          rate: 0,
          wait: 0,
          total: 0,
          paid: 0, // Default as 0 for now
          balance: 0, // Default as 0 for now
        };
      }

      customerSummary[customerName].trips += 1; // Count trips
      customerSummary[customerName].rate += parseFloat(trip.customerRate || 0);
      customerSummary[customerName].wait += parseFloat(trip.customerWaitingCharges || 0);
      customerSummary[customerName].paid += parseFloat(trip.amountReceived || 0);
      customerSummary[customerName].balance += parseFloat(trip.amountBalance || 0);
      customerSummary[customerName].total =
        customerSummary[customerName].rate + customerSummary[customerName].wait;
    });

    return Object.values(customerSummary);
  };

  const generateMonthlyExpenses = (expenses) => {
    const summary = {};

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const year = expenseDate.getFullYear();
      const month = String(expenseDate.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!summary[key]) {
        summary[key] = {
          year,
          month,
          totalExpenses: 0,
        };
      }

      summary[key].totalExpenses += parseFloat(expense.amount || 0);
    });

    return Object.values(summary).sort((a, b) => new Date(a.year, a.month) - new Date(b.year, b.month));
  };

  const generateLoadToOffloadReport = (trips) => {
    // Logic for generating LoadFrom and UploadTo report
    return [];
  };

  return (
    <ReportsContainer>
      <ContentContainer>
        <Header>
          <div>
            <label>
              From Date:
              <DateInput
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </label>
            <label>
              To Date:
              <DateInput
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </label>
          </div>
          <SearchButton onClick={fetchReports}>Search</SearchButton>
        </Header>

        {loading ? (
          <Loader>Loading...</Loader>
        ) : (
          <>
            {/* Month-Wise Summary Table */}
            <TableContainer>
              <h2>Month-Wise Summary</h2>
              <Table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Month</th>
                    <th>Trips</th>
                    <th>Customer Rate</th>
                    <th>Customer Wait</th>
                    <th>Customer Total</th>
                    <th>Driver Rate</th>
                    <th>Driver Wait</th>
                    <th>Driver Total</th>
                    <th>Expenses</th>
                    <th>Zakat</th>
                    <th>Deduction</th>
                    <th>Profit</th>
                    <th>Altaf</th>
                    <th>Mansoor</th>
                  </tr>
                </thead>
                <tbody>
                  {monthWiseData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.year || '-'}</td> {/* Display year */}
                      <td>{row.month || '-'}</td> {/* Display month */}
                      <td>{row.trips || 0}</td>
                      <td>{(row.customerRate || 0).toFixed(2)}</td>
                      <td>{(row.customerWait || 0).toFixed(2)}</td>
                      <td>{(row.customerTotal || 0).toFixed(2)}</td>
                      <td>{(row.driverRate || 0).toFixed(2)}</td>
                      <td>{(row.driverWait || 0).toFixed(2)}</td>
                      <td>{(row.driverTotal || 0).toFixed(2)}</td>
                      <td>{(row.expenses || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>

            {/* Additional tables for other reports */}
            <TableContainer>
              <TableWrapper>
                {/* Small Table for Customer and Driver Summary */}
                <SmallTableContainer>
                  <HeaderTitle>Customer & Driver Summary</HeaderTitle>
                  <SmallTable>
                    <thead>
                      <tr>
                        <SmallTableHeader>Description</SmallTableHeader>
                        <SmallTableHeader>Rate</SmallTableHeader>
                        <SmallTableHeader>Wait</SmallTableHeader>
                        <SmallTableHeader>Total</SmallTableHeader>
                        <SmallTableHeader>Paid</SmallTableHeader>
                        <SmallTableHeader>Balance</SmallTableHeader>
                        <SmallTableHeader>Trips</SmallTableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {customerDriverSummary && customerDriverSummary.customer && customerDriverSummary.driver ? (
                        <>
                          <tr>
                            <SmallTableCell>{customerDriverSummary.customer.description || '-'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.customer.rate || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.customer.wait || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.customer.total || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.customer.paid || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.customer.balance || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.customer.trips || 0}</SmallTableCell>
                          </tr>
                          <tr>
                            <SmallTableCell>{customerDriverSummary.driver.description || '-'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.driver.rate || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.driver.wait || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.driver.total || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.driver.paid || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.driver.balance || '0.00'}</SmallTableCell>
                            <SmallTableCell>{customerDriverSummary.driver.trips || 0}</SmallTableCell>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center' }}>
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </SmallTable>
                </SmallTableContainer>

                {/* Placeholder for Additional Table */}
                <LargeTableContainer>
                  <HeaderTitle>Customer Summary</HeaderTitle>

                  <LargeTable>
                    <LargeTableHead>
                      <LargeTableRow>
                        <LargeTableHeader>Customer</LargeTableHeader>
                        <LargeTableHeader>Trips</LargeTableHeader>
                        <LargeTableHeader>Rate</LargeTableHeader>
                        <LargeTableHeader>Wait</LargeTableHeader>
                        <LargeTableHeader>Total</LargeTableHeader>
                        <LargeTableHeader>Paid</LargeTableHeader>
                        <LargeTableHeader>Balance</LargeTableHeader>
                      </LargeTableRow>
                    </LargeTableHead>
                    <tbody>
                      {customerWiseReport.map((customer, index) => (
                        <LargeTableRow key={index}>
                          <LargeTableCell>{customer.customer}</LargeTableCell>
                          <LargeTableCell>{customer.trips}</LargeTableCell>
                          <LargeTableCell>{customer.rate.toFixed(2)}</LargeTableCell>
                          <LargeTableCell>{customer.wait.toFixed(2)}</LargeTableCell>
                          <LargeTableCell>{customer.total.toFixed(2)}</LargeTableCell>
                          <LargeTableCell>{customer.paid.toFixed(2)}</LargeTableCell>
                          <LargeTableCell>{customer.balance.toFixed(2)}</LargeTableCell>
                        </LargeTableRow>
                      ))}
                    </tbody>
                  </LargeTable>
                </LargeTableContainer>

                {/* New Monthly Expenses Table */}
                <MonthlyExpensesTableContainer>
                  <HeaderTitle>Monthly Expenses</HeaderTitle>
                  <MonthlyExpensesTable>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Month</th>
                        <th>Expenses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyExpenses.map((expense, index) => (
                        <tr key={index}>
                          <td>{expense.year}</td>
                          <td>{expense.month}</td>
                          <td>{expense.totalExpenses.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </MonthlyExpensesTable>
                </MonthlyExpensesTableContainer>

              </TableWrapper>
            </TableContainer>
          </>
        )}
      </ContentContainer>
      <ToastContainer />
    </ReportsContainer>
  );
};

export default Reports;
