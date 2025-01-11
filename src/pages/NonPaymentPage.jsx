import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const NonPaymentPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1e1e2f;
  color: #fff;
  font-family: Arial, sans-serif;
`;

const MessageContainer = styled.div`
  background: linear-gradient(135deg, #ffffff, #f1f1f1);
  padding: 2.5rem;
  border-radius: 15px;
  text-align: center;
  max-width: 450px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
`;

const Heading = styled.h1`
  font-size: 30px;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-weight: 700;
`;

const Message = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 1.5rem;
`;

const Highlight = styled.span`
  color: #e74c3c;
  font-weight: bold;
  font-size: 20px;
`;

const Timer = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #d35400;
  margin-bottom: 1.5rem;
`;

const ContactButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
`;

const NonPaymentPage = () => {
  const targetDate = new Date('2025-01-13T00:00:00');
  const [timeLeft, setTimeLeft] = useState(() => Math.floor((targetDate - new Date()) / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours.toString().padStart(2, '0')}h:${minutes
      .toString()
      .padStart(2, '0')}m:${secs.toString().padStart(2, '0')}s`;
  };

  const handleContactClick = () => {
    alert('Please contact admin@example.com for assistance.');
  };

  return (
    <NonPaymentPageContainer>
      <MessageContainer>
        <Heading>Critical Notice: Website and Data Deletion</Heading>
        <Message>
          Since there is no update on payment, we will delete all data and this website on{' '}
          <Highlight>13/01/2025 00:00:00</Highlight>.
        </Message>
        <Timer>Remaining time: {formatTime(timeLeft)}</Timer>
        <Message>
          Please contact the Hosting/Developer team immediately to resolve the issue.
        </Message>
      </MessageContainer>
    </NonPaymentPageContainer>
  );
};

export default NonPaymentPage;
