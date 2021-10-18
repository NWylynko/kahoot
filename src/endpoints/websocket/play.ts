import { FastifyRequest } from "fastify";
import { SocketStream } from "fastify-websocket";

import { clients } from "./clients"
import { games, getCurrentAnswer, addPlayer, removePlayer, addAnswer } from "./games";

interface Params {
  gamePin: string;
}

interface Query {
  userId: string;
  name: string;
}

export function playQuizHandler (this: any, connection: SocketStream, req: FastifyRequest) {

  const { gamePin } = req.params as Params;
  const { userId, name } = req.query as Query;

  clients[userId] = connection;
  addPlayer(gamePin, userId, name);

  const { redis } = this;

  connection.socket.on("message", (data: any) => {
    const event = JSON.parse(data.toString());
    console.log("event", event);

    if (event.event === "addAnswer") {
      const { answer, quizItemId } = event.payload
      addAnswer(gamePin, quizItemId, answer, userId);
      connection.socket.send(JSON.stringify({ event: "answer", payload: { answer: getCurrentAnswer(gamePin) } }));
    }
  });

  connection.socket.on("close", (code: any, reason: any) => {
    console.log("host connection closed", code, reason);
    removePlayer(gamePin, userId);
  });

  connection.socket.on("error", (err: any) => {
    console.log("host connection error", err);
  });

}