import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #2e2e2e;
`;

const LoginForm = styled.form`
  background: #e1e1e1;
  padding: 2rem;
  border-radius: 10px;
  width: 300px;
  color: #000;
  text-align: center;
`;

const Logo = styled.img`
  display: block;
  width: 150px;
  height: auto;
  margin: 0 auto 40px;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  background: #e1e1e1;
`;

const IconInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #666;
  border-radius: 5px;
  padding: 0.5rem;
  background-color: #e1e1e1;

  &:focus-within {
    border-color: #28a745;
  }
`;

const Icon = styled.div`
  color: #000;
  margin-right: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 0.5rem;
  background: #e1e1e1;
  color: #000;

  &::placeholder {
    color: #000;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: #000;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3860;
  margin-bottom: 1rem;
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Query Firestore for the user
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', email), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();

        // Save user details to localStorage
        const userData = {
          isLoggedIn: true,
          userId: userDoc.id, // Assuming `id` exists in the document
          email: userDoc.email,
          role: userDoc.role
        };
        localStorage.setItem('userData', JSON.stringify(userData));

        // Navigate to the next page
        navigate('/home', { state: { userId: userDoc.id } });
      } else {
        setError('Invalid email or password.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Failed to sign in. Please try again later.');
    }
  };

  return (
    <LoginPageContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Logo src={`${process.env.PUBLIC_URL}/Logo.jpeg`} alt="Logo" />
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <InputGroup>
          <IconInputContainer>
            <Icon>
              <FaUser />
            </Icon>
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your username"
              required
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
              required
            />
          </IconInputContainer>
        </InputGroup>

        <Button type="submit">Login</Button>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage;
