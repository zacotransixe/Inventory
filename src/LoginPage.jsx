// src/LoginPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // Updated import
import logo from './logo.png';

const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #2e2e2e;
`;

const LoginForm = styled.form`
  background: #000;
  padding: 2rem;
  border-radius: 10px;
  width: 300px;
  color: #fff;
`;

const Logo = styled.img`
  display: block;
  width: 150px;
  height: auto;
  margin: 0 auto 40px;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const IconInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #666;
  border-radius: 5px;
  padding: 0.5rem;
  background-color: #333;

  &:focus-within {
    border-color: #28a745;
  }
`;

const Icon = styled.div`
  color: #aaa;
  margin-right: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 0.5rem;
  background: transparent;
  color: #fff;

  &::placeholder {
    color: #aaa;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Updated hook

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      navigate('/', { state: { username } });  // Updated navigation
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <LoginPageContainer>
      <LoginForm onSubmit={handleSubmit}>
        <InputGroup>
          <IconInputContainer>
            <Icon>
              <FaUser />
            </Icon>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </IconInputContainer>
        </InputGroup>
        <InputGroup>
          <IconInputContainer>
            <Icon>
              <FaLock />
            </Icon>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </IconInputContainer>
        </InputGroup>

        <Button type="submit">Login</Button>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage;
