import { FastifyRequest, FastifyReply } from "fastify"
import { Quiz } from "../../types/Quiz";

export function newQuizHandler (this: any, req: FastifyRequest, res: FastifyReply) {
  const { redis } = this;
  const newQuiz = req.body as Quiz;

  redis.set(`quiz:${newQuiz.id}`, JSON.stringify(newQuiz), (err: Error, reply: any) => {
    if (err) {
      res.send(err);
    } else {
      redis.lpush("quizzes", JSON.stringify({ id: newQuiz.id, name: newQuiz.name }), (err: Error, reply: any) => {
        if (err) {
          res.send(err);
        } else {
          res.send(newQuiz);
        }
      });
    }
  });
}