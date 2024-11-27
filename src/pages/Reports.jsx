// src/pages/Reports.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component

const ReportsContainer = styled.div`
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

const ButtonCard = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const ReportButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #fff4d6; /* Light yellow background */
  border: 1px solid #ddd; /* Light border */
  border-radius: 8px; /* Rounded corners */
  font-size: 16px;
  color: #333; /* Darker text color for better contrast */
  cursor: pointer;
  transition: all 0.3s ease; /* Smooth transition for hover effects */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */

  &:hover {
    background-color: #ffe599; /* Slightly darker yellow on hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Deeper shadow on hover */
  }

  &:focus {
    outline: none;
    border-color: #ffcc00; /* Focus border color */
    box-shadow: 0 0 0 3px rgba(255, 204, 0, 0.5); /* Focus shadow */
  }
`;

const ReportContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-top: 20px;
`;

const Reports = () => {
    const [activeReport, setActiveReport] = useState(''); // State to manage active report

    const handleButtonClick = (reportName) => {
        setActiveReport(reportName); // Update the active report on button click
    };

    return (
        <ReportsContainer>
            <ContentContainer>
                {/* Button Card at the top */}
                <ButtonCard>
                    <ReportButton onClick={() => handleButtonClick('Rep1')}>Rep1</ReportButton>
                    <ReportButton onClick={() => handleButtonClick('Activities')}>Activities</ReportButton>
                    {/* Add more buttons as needed */}
                </ButtonCard>

                {/* Report Display Area */}
                {activeReport && (
                    <ReportContainer>
                        <h2>{activeReport} Report</h2>
                        <p>
                            {activeReport === 'Rep1' &&
                                'Detailed information and analysis about Rep1.'}
                            {activeReport === 'Activities' &&
                                'Comprehensive breakdown and insights about Activities.'}
                            {/* Add more report details as needed */}
                        </p>
                    </ReportContainer>
                )}
            </ContentContainer>
        </ReportsContainer>
    );
};

export default Reports;
