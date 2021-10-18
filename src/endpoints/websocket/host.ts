import { FastifyRequest } from "fastify";
import { SocketStream } from "fastify-websocket";

import { clients } from "./clients";
import { games, newGame, removeGame, nextQuestion } from "./games";

import { Quiz } from "../../types/Quiz";

interface Params {
  quizId: string;
}

interface Query {
  userId: string;
}

export function hostQuizHandler(
  this: any,
  connection: SocketStream,
  req: FastifyRequest
) {
  const { quizId } = req.params as Params;
  const { userId } = req.query as Query;
  const gamePin = (Math.floor(Math.random() * 90000) + 10000).toString();

  clients[userId] = connection;

  console.log(`[host] ${userId} is hosting quiz ${quizId} as ${gamePin}`);

  const { redis } = this;

  redis.get(`quiz:${quizId}`, (err: Error, quizString: any) => {
    const quiz: Quiz = JSON.parse(quizString);

    newGame({
      gamePin,
      hostId: userId,
      quizId,
      quizName: quiz.name,
      questions: quiz.questions,
    });
  });

  connection.socket.send(
    JSON.stringify({ event: "gamePin", payload: { gamePin } })
  );

  connection.socket.on("message", (data: any) => {
    const event = JSON.parse(data.toString());
    console.log("event", event);

    if (event.event === "nextQuestion") {
      nextQuestion(gamePin);
    }
  });

  connection.socket.on("close", (code: any, reason: any) => {
    console.log("host connection closed", code, reason);

    games[gamePin].players.map(({playerId}) => {
      const { socket } = clients[playerId]
      socket.send((JSON.stringify({
        event: "gameEnd",
      })));
      socket.close();
      delete clients[playerId];
    })

    removeGame(gamePin);
    delete clients[userId];

  });

  connection.socket.on("error", (err: any) => {
    console.log("host connection error", err);

    

  });
}
