import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate('/trips', { state: { userId: userCredential.user.uid } });
    } catch (error) {
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);

      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Try again later.');
          break;
        default:
          setError('Failed to sign in. Please check your credentials.');
      }
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
