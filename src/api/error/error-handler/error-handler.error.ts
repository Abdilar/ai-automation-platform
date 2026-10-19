import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../app.error";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    reply.code(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message
      }
    })
    return;
  }

  request.log.error({err: error}, "Unhandled API error")

  reply.code(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred"
    }
  })
}