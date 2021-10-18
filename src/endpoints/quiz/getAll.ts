import { FastifyRequest, FastifyReply } from "fastify"

export function getAllQuizzesHandler (this: any, req: FastifyRequest, res: FastifyReply) {
  const { redis } = this;

  redis.lrange("quizzes", 0, -1, (err: Error, quizzes: any) => {
    if (err) {
      res.send(err);
    } else {
      res.send(quizzes.map(JSON.parse));
    }
  });
}