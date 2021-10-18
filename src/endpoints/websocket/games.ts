
import { clients } from "./clients"

interface Games {
  [gamePin: string]: Game;
}

export const games: Games = {};

interface Game extends NewGame {
  players: {
    playerId: string;
    name: string;
  }[];
  playerCount: number;
  currentQuestion: number;
  answers: {
    [quizItemId: string]: {
      [optionId: string]: string[];
    };
  };
}

interface NewGame {
  gamePin: string;
  hostId: string;
  quizId: string;
  quizName: string;
  questions: {
    id: string;
    order: number;
    question: string;
    options: {
      id: string;
      text: string;
    }[];
    answer: string;
  }[]
}

export const newGame = ({ gamePin, hostId, quizName, quizId, questions }: NewGame) => {
  return games[gamePin] = {
    gamePin,
    hostId,
    quizId,
    quizName,
    players: [],
    playerCount: 0,
    questions,
    currentQuestion: -1,
    answers: {}
  };
}

export const removeGame = (gamePin: string) => {
  delete games[gamePin];
}

export const getGame = (gamePin: string) => {
  return games[gamePin];
}

export const addPlayer = (gamePin: string, playerId: string, name: string) => {
  const game = games[gamePin];
  if (game) {
    game.players.push({playerId, name});
  }
  clients[games[gamePin].hostId].socket.send(
    JSON.stringify({ event: "playerJoined", payload: { playerId, name }})
  );
}

export const removePlayer = (gamePin: string, playerId: string) => {
  const game = games[gamePin];
  if (game) {
    game.players = game.players.filter(player => player.playerId !== playerId);
  }
  clients[games[gamePin]?.hostId]?.socket.send(
    JSON.stringify({ event: "playerLeft", payload: { playerId }})
  );
}

export const getPlayerCount = (gamePin: string) => {
  const game = games[gamePin];
  if (game) {
    return game.playerCount;
  }
  return 0;
}

const fiveSeconds = 5 * 1000;
const twentySeconds = 20 * 1000;

export const nextQuestion = (gamePin: string) => {
  const game = games[gamePin];
  if (game) {
    game.currentQuestion++;
  }

  const startAt = new Date().getTime() + fiveSeconds
  const finishAt = startAt + twentySeconds;
  const question = games[gamePin].questions.find(question => question.order === games[gamePin].currentQuestion)
  const currentQuestion = games[gamePin].currentQuestion
  
  clients[games[gamePin].hostId].socket.send(
    JSON.stringify({ event: "nextQuestion", payload: {
      currentQuestion,
      startAt, finishAt,
      question,
    }})
  );

  games[gamePin].players.map(({playerId}) => {
    const socket = clients[playerId];
    if (socket) {
      socket.socket.send(JSON.stringify({ event: "nextQuestion", payload: {
        currentQuestion,
        startAt, finishAt,
        options: question?.options,
        quizItemId: question?.id,
      }}));
    }
  })

  setTimeout(() => {
    if (!question) return;
    clients[games[gamePin]?.hostId]?.socket.send(
      JSON.stringify({ event: "answers", payload: {
        answers: getAnswers(gamePin, question.id),
      }})
    );
  }, twentySeconds + fiveSeconds);

}

export const addAnswer = (gamePin: string, quizItemId: string, optionId: string, playerId: string) => {
  const game = games[gamePin];
  if (game) {
    if (!game.answers[quizItemId]) {
      game.answers[quizItemId] = {};
    }
    if (!game.answers[quizItemId][optionId]) {
      game.answers[quizItemId][optionId] = [];
    }
    game.answers[quizItemId][optionId].push(playerId);
  }
}

export const getAnswers = (gamePin: string, quizItemId: string) => {
  const game = games[gamePin];
  if (game) {
    return game.answers[quizItemId];
  }
  return {};
}

export const getCurrentAnswer = (gamePin: string) => {
  const game = games[gamePin];
  if (game) {
    const question = games[gamePin].questions.find(question => question.order === games[gamePin].currentQuestion)
    if (question) {
      return question.answer;
    }
  }
  return "";
}