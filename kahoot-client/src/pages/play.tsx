import { useState, useEffect } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { axios } from "../axios"
import { useHistory, useParams, useLocation } from "react-router-dom";
import React from 'react';
import { GameBoxInput } from '../components/GameBoxInput';
import { Link } from "react-router-dom"
import { useGlobalState } from '../context';
import { mainColours } from "../mainColours"


interface Params {
  gamePin: string;
}

interface locationState {
  nickname: string;
}

let websocket: WebSocket;

export default function Play () {

  const { gamePin } = useParams<Params>();
  const location = useLocation<locationState>();
  const { nickname } = location.state;
  const { userId } = useGlobalState();
  const [connecting, setConnecting] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [finishAtTimestamp, setFinishAtTimestamp] = useState<number | null>(null);
  const [startAtTimestamp, setStartAtTimestamp] = useState<number | null>(null);
  const [options, setOptions] = useState<{ id: string, text: string }[]>([]);
  const [quizItemId, setQuizItemId] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 100);
    return () => clearInterval(interval);
  }, [])

  useEffect(() => {

    websocket = new WebSocket(`ws://localhost:4000/api/websocket/play/${gamePin}?userId=${userId}&name=${nickname}`);

    websocket.onopen = () => {
      console.log("Connected to websocket");
      setConnecting(false);
    }

    websocket.onmessage = ({ data }) => {
      const event = JSON.parse(data);
      console.log(event.event);

      if (event.event === "nextQuestion") {
        console.log("Next question");
        console.log(event.payload);
        setCurrentQuestion(event.payload.currentQuestion);
        setOptions(event.payload.options);
        setStartAtTimestamp(event.payload.startAt);
        setFinishAtTimestamp(event.payload.finishAt);
        setQuizItemId(event.payload.quizItemId);
        setAnswer(null);
        setSelectedOption(null);
      } else if (event.event === "answer") {
        setAnswer(event.payload.answer);
      }
    }

    websocket.onclose = () => {
      console.log("Disconnected from websocket");
    }

    return () => {
      if (websocket) { websocket.close(); }
    }

  }, [])

  const addAnswer = (answer: string) => {
    setSelectedOption(answer);
    if (websocket) {
      websocket.send(JSON.stringify({ event: "addAnswer", payload: { answer, quizItemId } }));
    }
  }

  console.log({currentQuestion, startAtTimestamp, finishAtTimestamp})
  if (currentQuestion >= 0 && startAtTimestamp && finishAtTimestamp) {
    if (currentTime < startAtTimestamp) {
      return (
        <Container>
          <h2>Question {currentQuestion + 1}</h2>
          <h3>{startAtTimestamp - currentTime}</h3>
        </Container>
      )
    } else if (answer !== null && answer === selectedOption) {
      return (
        <Container>
          <h2>Correct</h2>
        </Container>
      )
    } else if (answer !== null && answer !== selectedOption) {
      return (
        <Container>
          <h2>Wrong</h2>
        </Container>
      )
    } else if (startAtTimestamp < currentTime && currentTime < finishAtTimestamp) {
      return (
        <Container>
          <OptionsContainer>
            {options.map((option, index) => (
              <Option onClick={() => addAnswer(option.id)} key={option.id} style={{ backgroundColor: mainColours[index] }} />
            ))}
          </OptionsContainer>
        </Container>
      )
    } else if (finishAtTimestamp < currentTime) {
      return (
        <Container>
          <h2>Time's up</h2>
        </Container>
      )
    }
  }
 
  if (connecting) {
    return (
      <Container>
        <h2>Connecting to server...</h2>
        <h3>{currentTime}</h3>
      </Container>
    )
  }

  return (
    <Container>
      <h1>You're In!</h1>
      <h2>See your nickname on screen?</h2>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background-color: #6714ce;
  min-height: 100vh;
  color: white;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-gap: 1rem;

  width: calc(100% - 2rem);
  height: calc(100vh - 2rem);

  padding: 1rem;
`;

const Option = styled.div`
  width: calc(100% - 2rem);
  height: calc(100% - 2rem);
  background-color: #e6e6e6;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
`;
