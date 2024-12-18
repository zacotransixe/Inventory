// src/pages/ChangePassword.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9f9f9;
`;

const Form = styled.form`
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 400px;
`;

const Heading = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #002985;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;

  
`;

const ErrorMessage = styled.div`
  color: #ff3860;
  margin-bottom: 15px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin-bottom: 15px;
`;

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Simulate user ID retrieval (update based on your logic)
      const userId = JSON.parse(localStorage.getItem('userData')).userId;
      const userDocRef = doc(db, 'users', userId);

      // Update password in Firestore
      await updateDoc(userDocRef, { password: newPassword });

      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError('Failed to update password. Please try again.');
    }
  };

  return (
    <Container>
      <Form onSubmit={handleChangePassword}>
        <Heading>Change Password</Heading>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        <Input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit">Update Password</Button>
      </Form>
    </Container>
  );
};

export default ChangePassword;
