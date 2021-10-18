import path from "path";

import Fastify from "fastify";
import FastifyStatic from "fastify-static";
import FastifyCors from "fastify-cors";
import fastifyRedis from "fastify-redis";
import FastifyWebsocket from "fastify-websocket";

import { newQuizHandler } from "./endpoints/quiz/new"
import { getAllQuizzesHandler } from "./endpoints/quiz/getAll"

import { hostQuizHandler } from "./endpoints/websocket/host";
import { playQuizHandler } from "./endpoints/websocket/play";

export const app = Fastify({ logger: true })

app.register(FastifyCors, {
  origin: "*",
});

app.register(FastifyStatic, {
  root: path.join(__dirname, "..", "kahoot-client", "build"),
  prefix: "/"
});

app.register(fastifyRedis, { host: '127.0.0.1' })

app.register(FastifyWebsocket)

app.post("/api/quiz/new", newQuizHandler)
app.get("/api/quizzes", getAllQuizzesHandler)

app.get("/api/websocket/host/:quizId", { websocket: true }, hostQuizHandler)
app.get("/api/websocket/play/:gamePin", { websocket: true }, playQuizHandler)