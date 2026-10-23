import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../app.error";
import { LLMError } from "../llm";
import { LLM_HTTP_ERRORS } from "../error.constant";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    reply.code(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof LLMError) {
    const llmErrors = LLM_HTTP_ERRORS[error.code];

    request.log.error({ err: error }, "LLM operation failed");

    reply.code(llmErrors.statusCode).send({
      error: {
        code: error.code,
        message: llmErrors.message,
      },
    });
    return;
  }

  request.log.error(
    { err: error },
    "Unhandled API error",
  );

  reply.code(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
