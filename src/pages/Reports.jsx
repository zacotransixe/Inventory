import React, { useState } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Timestamp } from "firebase/firestore";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { unparse } from 'papaparse';



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
  font-family: Aptos Display;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 0 10px;
`;

const SearchButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #002985;
  color: white;
  font-family: Aptos Display;
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
    background-color: #002985;
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

const HeaderTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

const LargeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const LargeTableHead = styled.thead`
  background-color: #002985;
  color: #fff;
`;

const LargeTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
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
    background-color: #002985;
    color: white;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
`;

const Tab = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  background-color: ${({ active }) => (active ? '#002985' : 'white')};
  color: ${({ active }) => (active ? 'white' : '#002985')};
  border: none;
  cursor: pointer;
  border-bottom: ${({ active }) => (active ? '2px solid #002985' : 'none')};

`;

const ExportButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px; /* Add spacing below the button if needed */
  margin-right:10px;
`;

const ExportButton = styled.button`
  padding: 5px 10px;
  background-color: #002985;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

 
`;

const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState(0); // State to track active tab

  const [loading, setLoading] = useState(false);
  const [monthWiseData, setMonthWiseData] = useState([]);
  const [customerDriverSummary, setCustomerDriverTotals] = useState([]);
  const [customerWiseReport, setCustomerWiseReport] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [firstLoadOffloadSummary, setFirstLoadOffloadSummary] = useState([]); // New state
  const [admins, setAdmins] = useState([]); // Add this to store admin data


  const fetchReports = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both From Date and To Date.');
      return;
    }

    setLoading(true);

    try {
      const tripsQuery = query(
        collection(db, 'trips'),
        where('tripDate', '>=', fromDate),
        where('tripDate', '<=', toDate)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const tripsData = tripsSnapshot.docs.map((doc) => doc.data());

      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '>=', Timestamp.fromDate(new Date(fromDate))),
        where('date', '<=', Timestamp.fromDate(new Date(toDate)))
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const expensesData = expensesSnapshot.docs.map((doc) => doc.data());
      console.log('Expenses:', expensesData);



      // Fetch adminData and filter by active status within the date range
      const adminSnapshot = await getDocs(collection(db, 'adminData'));
      const adminData = adminSnapshot.docs
        .map((doc) => doc.data())
        .filter((admin) => {
          if (admin.status === 'Inactive' && admin.endDate) {
            const endDate = new Date(admin.endDate);
            const rangeStart = new Date(fromDate);
            const rangeEnd = new Date(toDate);
            return endDate >= rangeStart && endDate <= rangeEnd;
          }
          return admin.status === 'Active';
        });

      setAdmins(adminData); // Update the admins state

      const partnerExpenses = await fetchPartnerExpenses();


      const monthSummary = generateMonthSummary(tripsData, expensesData, adminData, partnerExpenses);
      setMonthWiseData(monthSummary);

      const customerDriverSummaryData = generateCustomerDriverSummary(tripsData);
      setCustomerDriverTotals(customerDriverSummaryData); // Update the state here

      const customerSummary = generateCustomerWiseReport(tripsData);
      setCustomerWiseReport(customerSummary);

      const monthlyExpensesSummary = generateMonthlyExpenses(expensesData);
      setMonthlyExpenses(monthlyExpensesSummary);

      const firstLoadOffloadData = generateFirstLoadOffloadSummary(tripsData); // Generate new data
      setFirstLoadOffloadSummary(firstLoadOffloadData);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error fetching reports: ' + error.message);
    }
  };

  const fetchPartnerExpenses = async () => {
    try {
      const partnerExpensesCollection = collection(db, "PRTData"); // Reference to the PRTData collection
      const snapshot = await getDocs(partnerExpensesCollection); // Fetch documents from the collection

      // Map the snapshot to extract required fields
      const partnerExpenses = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          partnerName: data.partnerName,
          amount: parseFloat(data.amount), // Convert amount to number
          date: data.date.toDate(), // Convert Firestore Timestamp to JavaScript Date
        };
      });

      console.log("Fetched Partner Expenses:", partnerExpenses);

      return partnerExpenses;
    } catch (error) {
      console.error("Error fetching partner expenses:", error);
      return []; // Return an empty array in case of error
    }
  };


  const generateMonthSummary = (trips = [], expenses = [], admins = [], partnerExpenses = []) => {
    const summary = {};
    console.log("Trips Data:", trips);
    console.log("Expenses Data:", expenses);
    console.log("Admins Data:", admins);
    console.log("Partner Expenses Data:", partnerExpenses);

    // Process trips
    trips.forEach((trip) => {
      const tripDate = new Date(trip.tripDate);
      const year = tripDate.getFullYear();
      const month = String(tripDate.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!summary[key]) {
        summary[key] = {
          year,
          month,
          trips: 0,
          customerRate: 0,
          customerWait: 0,
          customerTotal: 0,
          driverRate: 0,
          driverWait: 0,
          driverTotal: 0,
          expenses: 0,
          deduction: 0,
          profit: 0,
          profitShares: {},
        };
      }

      summary[key].trips += 1;
      summary[key].customerRate += parseFloat(trip.customerRate || 0);
      summary[key].customerWait += parseFloat(trip.customerWaitingCharges || 0);
      summary[key].driverRate += parseFloat(trip.driverRate || 0);
      summary[key].driverWait += parseFloat(trip.driverWaitingCharges || 0);
      summary[key].customerTotal =
        summary[key].customerRate + summary[key].customerWait;
      summary[key].driverTotal =
        summary[key].driverRate + summary[key].driverWait;

      // Calculate deduction (3%) without including expenses
      summary[key].deduction = Number(
        (summary[key].customerTotal - summary[key].driverTotal) * 0.03
      );
    });

    console.log("Intermediate Summary (after trips):", summary);

    // Process expenses
    expenses.forEach((expense) => {
      let expenseDate;
      if (expense.date?.toDate) {
        expenseDate = expense.date.toDate(); // Firestore Timestamp to Date
      } else if (typeof expense.date === 'string' || expense.date instanceof String) {
        expenseDate = new Date(expense.date); // Parse string to Date object
      } else {
        expenseDate = new Date(expense.date); // Assume it's already a valid Date or timestamp
      }

      if (isNaN(expenseDate.getTime())) {
        console.warn('Invalid date in expense:', expense);
        return; // Skip invalid dates
      }

      const year = expenseDate.getFullYear();
      const month = String(expenseDate.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!summary[key]) {
        summary[key] = {
          year,
          month,
          trips: 0,
          customerRate: 0,
          customerWait: 0,
          customerTotal: 0,
          driverRate: 0,
          driverWait: 0,
          driverTotal: 0,
          expenses: 0,
          deduction: 0,
          profit: 0,
          profitShares: {},
        };
      }

      summary[key].expenses += parseFloat(expense.amount || 0);
    });

    console.log("Intermediate Summary (after expenses):", summary);

    // Calculate profits and distribute shares
    Object.keys(summary).forEach((key) => {
      const { customerTotal, driverTotal, expenses, deduction } = summary[key];
      // Profit includes expenses
      summary[key].profit =
        customerTotal - driverTotal - expenses - deduction;

      const [year, month] = key.split('-');
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      monthEnd.setHours(23, 59, 59, 999);

      console.log(`Processing Summary for ${key}:`, summary[key]);

      // Filter active admins
      const activeAdmins = admins.filter((admin) => {
        const adminStart = new Date(admin.startDate).getTime();
        const adminEnd = admin.endDate
          ? new Date(admin.endDate).getTime()
          : null;

        const isActive =
          adminStart <= monthEnd.getTime() &&
          (!adminEnd || adminEnd >= monthStart.getTime());

        console.log(
          `Admin "${admin.name}" (Start: ${admin.startDate}, End: ${admin.endDate || "Ongoing"
          }): Month Start: ${monthStart}, Month End: ${monthEnd}, Active? ${isActive}`
        );

        return isActive;
      });

      console.log(`Active Admins for ${key}:`, activeAdmins);

      // Calculate total percentage
      const totalPercentage = activeAdmins.reduce(
        (sum, admin) => sum + parseFloat(admin.percentage || 0),
        0
      );

      console.log(`Total Percentage for ${key}:`, totalPercentage);

      // Distribute profit shares
      activeAdmins.forEach((admin) => {
        const percentage = parseFloat(admin.percentage || 0) / 100;

        if (!summary[key].profitShares[admin.name]) {
          summary[key].profitShares[admin.name] = 0;
        }

        summary[key].profitShares[admin.name] +=
          summary[key].profit * percentage || 0;

        console.log(
          `Admin "${admin.name}" Share in ${key}:`,
          summary[key].profitShares[admin.name]
        );
      });

      console.log("Partner Expenses Data:", partnerExpenses);

      // Deduct partner expenses
      partnerExpenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);
          const expenseYear = expenseDate.getFullYear();
          const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, '0');
          return `${expenseYear}-${expenseMonth}` === key;
        })
        .forEach((expense) => {
          const partnerName = expense.partnerName;
          const amount = parseFloat(expense.amount || 0);

          if (summary[key].profitShares[partnerName]) {
            summary[key].profitShares[partnerName] -= amount;

            if (!summary[key].deductions) {
              summary[key].deductions = {};
            }
            if (!summary[key].deductions[partnerName]) {
              summary[key].deductions[partnerName] = 0;
            }
            summary[key].deductions[partnerName] += amount;

            console.log(
              `Deducting ${amount} for "${partnerName}" in ${key}:`,
              summary[key].profitShares[partnerName]
            );
          }
        });

      // Ensure all admins have a share, even if zero
      admins.forEach((admin) => {
        if (!summary[key].profitShares[admin.name]) {
          summary[key].profitShares[admin.name] = 0;
        }
      });

      console.log(`Final Profit Shares for ${key}:`, summary[key].profitShares);
    });

    console.log("Final Summary:", summary);

    return Object.values(summary).sort(
      (a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1)
    );
  };

  const generateCustomerDriverSummary = (trips) => {
    console.log('Trips : ', trips);

    if (!trips || trips.length === 0) {
      return {};
    }

    // Utility to extract month and year safely
    const getMonthYear = (dateInput) => {
      let date;

      // Check if the input is a Firebase Timestamp
      if (dateInput?.toDate) {
        date = dateInput.toDate(); // Convert Firestore Timestamp to JS Date
      } else if (typeof dateInput === "string") {
        date = new Date(dateInput); // Parse string to JS Date
      } else if (dateInput instanceof Date) {
        date = dateInput; // Already a JS Date
      } else {
        console.warn("Invalid date:", dateInput);
        return { month: "Unknown", year: "Unknown" }; // Default values
      }

      // Extract Month and Year
      return {
        month: date.toLocaleString("default", { month: "short" }), // e.g., Jan
        year: date.getFullYear(), // e.g., 2024
      };
    };

    // Initialize summary
    const summary = {};

    trips.forEach((trip) => {
      const { month, year } = getMonthYear(trip.tripDate); // Use safe date parsing
      const key = `${month}-${year}`;

      if (!summary[key]) {
        summary[key] = {
          month,
          year,
          customer: { description: "Customer", rate: 0, wait: 0, total: 0, paid: 0, balance: 0, trips: 0 },
          driver: { description: "Driver", rate: 0, wait: 0, total: 0, paid: 0, balance: 0, trips: 0 },
        };
      }

      // Aggregate Customer values
      summary[key].customer.rate += parseFloat(trip.customerRate || 0);
      summary[key].customer.wait += parseFloat(trip.customerWaitingCharges || 0);
      summary[key].customer.paid += parseFloat(trip.amountReceived || 0);
      summary[key].customer.balance += parseFloat(trip.amountBalance || 0);
      summary[key].customer.trips += 1;

      // Aggregate Driver values
      summary[key].driver.rate += parseFloat(trip.driverRate || 0);
      summary[key].driver.wait += parseFloat(trip.driverWaitingCharges || 0);
      summary[key].driver.paid += parseFloat(trip.amountPaid || 0);
      summary[key].driver.balance += parseFloat(trip.amountBalance1 || 0);
      summary[key].driver.trips += 1;
    });

    // Format values to two decimal places
    Object.keys(summary).forEach((key) => {
      summary[key].customer.rate = summary[key].customer.rate.toFixed(2);
      summary[key].customer.wait = summary[key].customer.wait.toFixed(2);
      summary[key].customer.total = (
        parseFloat(summary[key].customer.rate) + parseFloat(summary[key].customer.wait)
      ).toFixed(2);
      summary[key].customer.paid = summary[key].customer.paid.toFixed(2);
      summary[key].customer.balance = summary[key].customer.balance.toFixed(2);

      summary[key].driver.rate = summary[key].driver.rate.toFixed(2);
      summary[key].driver.wait = summary[key].driver.wait.toFixed(2);
      summary[key].driver.total = (
        parseFloat(summary[key].driver.rate) + parseFloat(summary[key].driver.wait)
      ).toFixed(2);
      summary[key].driver.paid = summary[key].driver.paid.toFixed(2);
      summary[key].driver.balance = summary[key].driver.balance.toFixed(2);
    });

    return summary;
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

  const generateMonthlyExpenses = (expenses = []) => {
    if (!expenses || expenses.length === 0) {
      return []; // Return empty array if no expenses
    }

    const summary = {};

    expenses.forEach((expense) => {
      let expenseDate;
      // Check if `expense.date` is a Firestore Timestamp
      if (expense.date?.toDate) {
        expenseDate = expense.date.toDate(); // Convert Firestore Timestamp to JavaScript Date
      } else if (typeof expense.date === 'string' || expense.date instanceof String) {
        expenseDate = new Date(expense.date); // Parse string to Date object
      } else {
        expenseDate = new Date(expense.date); // Assume it's already a valid Date or timestamp
      }

      // Check if the expenseDate is valid
      if (isNaN(expenseDate.getTime())) {
        console.warn('Invalid date in expense:', expense);
        return; // Skip this expense if the date is invalid
      }

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

    return Object.values(summary).sort(
      (a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1)
    );
  };

  // New Function: Generate First Load-Offload Summary
  const generateFirstLoadOffloadSummary = (trips) => {
    const summary = {};

    trips.forEach((trip) => {
      const tripDate = new Date(trip.tripDate);
      const year = tripDate.getFullYear();
      const month = String(tripDate.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      const combination = `${trip.firstLoading || 'Unknown'} - ${trip.firstOffloading || 'Unknown'}`;

      if (!summary[key]) {
        summary[key] = {};
      }

      if (!summary[key][combination]) {
        summary[key][combination] = 0;
      }

      summary[key][combination] += 1;
    });

    return Object.entries(summary).map(([month, combinations]) => ({
      month,
      combinations: Object.entries(combinations).map(([combination, count]) => ({
        combination,
        count,
      })),
    }));
  };

  const exportFirstLoadOffloadSummary = () => {
    const csvData = firstLoadOffloadSummary.flatMap((entry) =>
      entry.combinations.map((combo) => ({
        Month: entry.month,
        Combination: combo.combination,
        Count: combo.count,
      }))
    );

    exportToCSV(csvData, 'FirstLoadOffloadSummary.csv');
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      console.error("No data available to export.");
      return;
    }

    const csv = unparse(data); // Convert data to CSV format
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* Tabs Navigation */}
        <TabsContainer>
          <Tab active={activeTab === 0} onClick={() => setActiveTab(0)}>
            Month-Wise Summary
          </Tab>
          <Tab active={activeTab === 1} onClick={() => setActiveTab(1)}>
            Customer & Driver Summary
          </Tab>
          <Tab active={activeTab === 2} onClick={() => setActiveTab(2)}>
            Customer Summary
          </Tab>
          <Tab active={activeTab === 3} onClick={() => setActiveTab(3)}>
            Monthly Expenses
          </Tab>
          <Tab active={activeTab === 4} onClick={() => setActiveTab(4)}>
            Origin - Destination Summary
          </Tab>
        </TabsContainer>

        {/* Tab Content */}
        {loading ? (
          <Loader>Loading...</Loader>
        ) : (
          <>
            {activeTab === 0 && (
              <TableContainer>
                <HeaderTitle>Month-Wise Summary
                  <ExportButtonContainer>
                    <ExportButton
                      onClick={() =>
                        exportToCSV(
                          monthWiseData.map((row) => ({
                            Year: row.year,
                            Month: row.month,
                            Trips: row.trips,
                            CustomerRate: row.customerRate.toFixed(2),
                            CustomerWait: row.customerWait.toFixed(2),
                            CustomerTotal: row.customerTotal.toFixed(2),
                            DriverRate: row.driverRate.toFixed(2),
                            DriverWait: row.driverWait.toFixed(2),
                            DriverTotal: row.driverTotal.toFixed(2),
                            Expenses: row.expenses.toFixed(2),
                            Deduction: row.deduction.toFixed(2),
                            Profit: row.profit.toFixed(2),
                            ...Object.fromEntries(
                              admins.map((admin) => [
                                admin.name,
                                row.profitShares[admin.name]?.toFixed(2) || "0.00",
                              ])
                            ),
                          })),
                          'MonthWiseSummary.csv'
                        )
                      }
                    >
                      Export to CSV
                    </ExportButton>
                  </ExportButtonContainer>
                </HeaderTitle>
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
                      <th>Deduction (3%)</th>
                      <th>Expenses</th>

                      <th>Profit</th>
                      {admins.map((admin) => (
                        <th key={admin.id}>{admin.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthWiseData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.year || "-"}</td>
                        <td>{row.month || "-"}</td>
                        <td>{row.trips || 0}</td>
                        <td>{(row.customerRate || 0).toFixed(2)}</td>
                        <td>{(row.customerWait || 0).toFixed(2)}</td>
                        <td>{(row.customerTotal || 0).toFixed(2)}</td>
                        <td>{(row.driverRate || 0).toFixed(2)}</td>
                        <td>{(row.driverWait || 0).toFixed(2)}</td>
                        <td>{(row.driverTotal || 0).toFixed(2)}</td>
                        <td>{(row.deduction || 0).toFixed(2)}</td>
                        <td>{(row.expenses || 0).toFixed(2)}</td>
                        <td>{(row.profit || 0).toFixed(2)}</td>
                        {admins.map((admin) => (
                          <td key={admin.id} data-tooltip-id="admin-tooltip"
                            data-tooltip-content={`Deduction: ${(row.deductions?.[admin.name] || 0).toFixed(2)}`}>
                            {(row.profitShares[admin.name] || 0).toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>


                </Table>

              </TableContainer>


            )}
            {activeTab === 1 && (
              <TableContainer>
                <HeaderTitle>
                  Customer & Driver Summary
                  <ExportButtonContainer>
                    <ExportButton
                      onClick={() =>
                        exportToCSV(
                          Object.keys(customerDriverSummary).flatMap((monthKey) => [
                            {
                              Month: monthKey, // Month-Year added
                              Description: "Customer",
                              Rate: customerDriverSummary[monthKey].customer.rate,
                              Wait: customerDriverSummary[monthKey].customer.wait,
                              Total: customerDriverSummary[monthKey].customer.total,
                              Paid: customerDriverSummary[monthKey].customer.paid,
                              Balance: customerDriverSummary[monthKey].customer.balance,
                              Trips: customerDriverSummary[monthKey].customer.trips,
                            },
                            {
                              Month: monthKey, // Month-Year added
                              Description: "Driver",
                              Rate: customerDriverSummary[monthKey].driver.rate,
                              Wait: customerDriverSummary[monthKey].driver.wait,
                              Total: customerDriverSummary[monthKey].driver.total,
                              Paid: customerDriverSummary[monthKey].driver.paid,
                              Balance: customerDriverSummary[monthKey].driver.balance,
                              Trips: customerDriverSummary[monthKey].driver.trips,
                            },
                          ]),
                          "CustomerDriverSummary.csv"
                        )
                      }
                    >
                      Export to CSV
                    </ExportButton>
                  </ExportButtonContainer>
                </HeaderTitle>
                <Table>
                  <thead>
                    <tr>
                      <th>Month</th> {/* Add a new column for Month */}
                      <th>Year</th> {/* Add a new column for Month */}

                      <th>Description</th>
                      <th>Rate</th>
                      <th>Wait</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Trips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDriverSummary && Object.keys(customerDriverSummary).length > 0 ? (
                      Object.keys(customerDriverSummary).map((key) => {
                        const { month, year, customer, driver } = customerDriverSummary[key];

                        return (
                          <>
                            <tr key={`${key}-customer`}>
                              <td rowSpan="2">{month}</td> {/* Month Column */}
                              <td rowSpan="2">{year}</td> {/* Year Column */}
                              <td>{customer.description || "-"}</td>
                              <td>{customer.rate || "0.00"}</td>
                              <td>{customer.wait || "0.00"}</td>
                              <td>{customer.total || "0.00"}</td>
                              <td>{customer.paid || "0.00"}</td>
                              <td>{customer.balance || "0.00"}</td>
                              <td>{customer.trips || 0}</td>
                            </tr>
                            <tr key={`${key}-driver`}>
                              <td>{driver.description || "-"}</td>
                              <td>{driver.rate || "0.00"}</td>
                              <td>{driver.wait || "0.00"}</td>
                              <td>{driver.total || "0.00"}</td>
                              <td>{driver.paid || "0.00"}</td>
                              <td>{driver.balance || "0.00"}</td>
                              <td>{driver.trips || 0}</td>
                            </tr>
                          </>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>


                </Table>
              </TableContainer>
            )}

            {activeTab === 2 && (
              <TableContainer>
                <HeaderTitle>Customer Summary
                  <ExportButtonContainer>
                    <ExportButton
                      onClick={() =>
                        exportToCSV(
                          customerWiseReport.map((customer) => ({
                            Customer: customer.customer,
                            Trips: customer.trips,
                            Rate: customer.rate.toFixed(2),
                            Wait: customer.wait.toFixed(2),
                            Total: customer.total.toFixed(2),
                            Paid: customer.paid.toFixed(2),
                            Balance: customer.balance.toFixed(2),
                          })),
                          'CustomerSummary.csv'
                        )
                      }
                    >
                      Export to CSV
                    </ExportButton>
                  </ExportButtonContainer>
                </HeaderTitle>
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
              </TableContainer>
            )}
            {activeTab === 3 && (
              <TableContainer>
                <HeaderTitle>Monthly Expenses
                  <ExportButtonContainer>
                    <ExportButton
                      onClick={() =>
                        exportToCSV(
                          monthlyExpenses.map((expense) => ({
                            Year: expense.year,
                            Month: expense.month,
                            TotalExpenses: expense.totalExpenses.toFixed(2),
                          })),
                          'MonthlyExpenses.csv'
                        )
                      }
                    >
                      Export to CSV
                    </ExportButton>
                  </ExportButtonContainer>
                </HeaderTitle>
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
              </TableContainer>
            )}
            {activeTab === 4 && (
              <TableContainer>
                <HeaderTitle>Origin - Destination Summary
                  <ExportButtonContainer>
                    <ExportButton onClick={exportFirstLoadOffloadSummary}>
                      Export to CSV
                    </ExportButton>
                  </ExportButtonContainer>
                </HeaderTitle>
                <Table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Combination</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firstLoadOffloadSummary.map((entry, index) => (
                      <React.Fragment key={index}>
                        {entry.combinations.map((combo, idx) => (
                          <tr key={`${index}-${idx}`}>
                            <td>{idx === 0 ? entry.month : ''}</td>
                            <td>{combo.combination}</td>
                            <td>{combo.count}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </ContentContainer>
      <ReactTooltip id="admin-tooltip" />
      <ToastContainer />
    </ReportsContainer>
  );
};


export default Reports;
