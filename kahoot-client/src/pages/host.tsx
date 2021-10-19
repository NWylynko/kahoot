import { useState, useEffect } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { axios } from "../axios";
import { mainColours } from "../mainColours";
import { useHistory, useParams } from "react-router-dom";
import React from "react";
import { GameBoxInput } from "../components/GameBoxInput";
import { Link } from "react-router-dom";
import { useGlobalState } from "../context";
import type { QuizItem } from "./create";

interface Params {
  quizId: string;
}

interface Answers {
  [quizItemId: string]: {
    [optionId: string]: string[];
  };
}

let websocket: WebSocket;

export default function Host() {
  const { quizId } = useParams<Params>();
  const { userId } = useGlobalState();
  const [gamePin, setGamePin] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ playerId: string; name: string }[]>(
    []
  );

  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [finishAtTimestamp, setFinishAtTimestamp] = useState<number | null>(
    null
  );
  const [startAtTimestamp, setStartAtTimestamp] = useState<number | null>(null);
  const [question, setQuestion] = useState<QuizItem | null>(null);
  const [answers, setAnswers] = useState<Answers | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    websocket = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/websocket/host/${quizId}?userId=${userId}`
    );

    websocket.onopen = () => {
      console.log("Connected to websocket");
    };

    websocket.onmessage = ({ data }) => {
      const event = JSON.parse(data);
      console.log(event.event);

      if (event.event === "gamePin") {
        setGamePin(event.payload.gamePin);
      } else if (event.event === "playerJoined") {
        setPlayers((players) => [...players, event.payload]);
      } else if (event.event === "playerLeft") {
        setPlayers((players) =>
          players.filter((player) => player.playerId !== event.payload.playerId)
        );
      } else if (event.event === "nextQuestion") {
        console.log("Next question");
        console.log(event.payload);
        setCurrentQuestion(event.payload.currentQuestion);
        setQuestion(event.payload.question);
        setStartAtTimestamp(event.payload.startAt);
        setFinishAtTimestamp(event.payload.finishAt);
      } else if (event.event === "answers") {
        console.log("Answers");
        console.log(event.payload);
        setAnswers(event.payload.answers);
      } else if (event.event === "gameDone") {
        console.log("Game Done");
        console.log(event.payload);
      }
    };

    websocket.onclose = () => {
      console.log("Disconnected from websocket");
    };

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const startGame = () => {
    websocket.send(JSON.stringify({ event: "nextQuestion" }));
  };

  if (
    currentQuestion >= 0 &&
    startAtTimestamp &&
    finishAtTimestamp &&
    question
  ) {
    if (currentTime < startAtTimestamp) {
      return (
        <Container>
          <h2>Quiz</h2>
          <h3>{question?.question}</h3>
        </Container>
      );
    } else if (
      startAtTimestamp < currentTime &&
      currentTime < finishAtTimestamp
    ) {
      return (
        <Container>
          <h2>{question?.question}</h2>
          <h3>{Math.floor((finishAtTimestamp - currentTime) / 1000)}s left</h3>
          <OptionsContainer>
            {question?.options.map((option, index) => (
              <Option
                key={option.id}
                style={{ backgroundColor: mainColours[index] }}
              >
                <span>{option.text}</span>
              </Option>
            ))}
          </OptionsContainer>
        </Container>
      );
    } else if (finishAtTimestamp < currentTime) {
      return (
        <Container>
          <h2>{question?.question}</h2>
          <button onClick={startGame}>Next</button>
          <OptionsContainer>
            {question?.options.map((option, index) => (
              <SelectableOption
                key={option.id}
                style={{ backgroundColor: mainColours[index] }}
                selected={question.answer === option.id}
              >
                <span>{option.text}</span>
                <span>{answers ? answers[option.id] ? answers[option.id].length : 0 : 0}</span>
              </SelectableOption>
            ))}
          </OptionsContainer>
        </Container>
      );
    }
  }

  return (
    <Container>
      <Header>
        <div />
        <h1>Game Pin - {gamePin ? gamePin : "Loading"}</h1>
        <button onClick={startGame}>Start</button>
      </Header>
      <PlayerNameContainer>
        {players.map((player) => (
          <PlayerName key={player.playerId}>{player.name}</PlayerName>
        ))}
      </PlayerNameContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #6714ce;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #f6efff;
  width: calc(100% - 40px);
`;

const PlayerNameContainer = styled.div`
  padding: 1rem;
`;

const PlayerName = styled.h2`
  background-color: #f6efff76;
  margin: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-gap: 1rem;

  width: calc(100% - 2rem);
  padding: 1rem;
`;

const Option = styled.div`
  width: calc(100% - 2rem);
  height: calc(100% - 2rem);
  background-color: #e6e6e6;
  color: white;
  padding: 1rem;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

interface SelectableOptionProps {
  selected: boolean;
}

const SelectableOption = styled(Option)`
  opacity: ${(props: SelectableOptionProps) => (props.selected ? "1" : "0.6")};
`;
