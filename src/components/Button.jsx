// src/components/Button.jsx
import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ color }) => color || '#28a745'};
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${({ hoverColor }) => hoverColor || '#218838'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
  }
`;

const Button = ({ children, color, hoverColor, onClick }) => {
    return (
        <StyledButton color={color} hoverColor={hoverColor} onClick={onClick}>
            {children}
        </StyledButton>
    );
};

export default Button;
