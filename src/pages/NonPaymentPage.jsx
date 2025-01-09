import React from 'react';
import styled from 'styled-components';

const NonPaymentPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #2e2e2e;
  text-align: center;
`;

const MessageContainer = styled.div`
  background: #e1e1e1;
  padding: 2rem;
  border-radius: 10px;
  color: #000;
  max-width: 400px;
`;

const Heading = styled.h1`
  font-size: 28px;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 18px;
  line-height: 1.5;
`;

const Highlight = styled.span`
  color: red;
  font-weight: bold;
`;

const ContactButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const NonPaymentPage = () => {
    const handleContactClick = () => {
        alert('Please contact admin@example.com for assistance.');
    };

    return (
        <NonPaymentPageContainer>
            <MessageContainer>
                <Heading>Site Temporarily Unavailable</Heading>
                <Message>
                    Due to <Highlight>non-payment</Highlight>, this site is currently unavailable. Please contact the admin for
                    more information and to resolve the issue.
                </Message>
                <ContactButton >Contact Admin</ContactButton>
            </MessageContainer>
        </NonPaymentPageContainer>
    );
};

export default NonPaymentPage;
