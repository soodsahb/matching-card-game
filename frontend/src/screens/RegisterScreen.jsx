// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { register } from '../actions/authActions';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: #34495e;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  border: none;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const RegisterScreen = ({ history }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    dispatch(register(username, email, password));
  };

  return (
    <Container>
      <h1>Card Game Registration</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit">Register</Button>
      </Form>
      <p>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#e74c3c' }}>
          Login
        </a>
      </p>
    </Container>
  );
};

export default RegisterScreen;
