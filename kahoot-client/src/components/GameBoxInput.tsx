import { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from "react-router-dom";

export const GameBoxInput = () => {
  const [gamePin, setGamePin] = useState('');
  const [submittedPin, setSubmittedPin] = useState(false);
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const history = useHistory();

  const submitGamePin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedPin(true);
    setGamePin(pin);
  }

  const submitNickname = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    history.push(`/play/${gamePin}`, { nickname });
  };

  if (gamePin && submittedPin) {
    return (
      <Form onSubmit={submitNickname}>
        <Input placeholder="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <Button>OK, go!</Button>
      </Form>
    )
  }

  return (
    <Form onSubmit={submitGamePin}>
      <Input placeholder="Game PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
      <Button type="submit">Enter</Button>
    </Form>
  )
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 250px;
  background-color: white;
  padding: 1rem;
  border-radius: 5px;
  margin: 1rem;
`;

const Input = styled.input`
  width: calc(100% - 2rem);
  padding: 0.75rem;
  margin: 0.5rem;
  margin-top: 0.5rem;
  font-weight: bolder;

  text-align: center;
`;

const Button = styled.button`
  width: calc(100% - 0.25rem);
  padding: 0.75rem;
  margin: 0.25rem;
  background-color: #424242;
  border-radius: 5px;
  border: none;
  color: white;
  font-weight: bolder;
`;