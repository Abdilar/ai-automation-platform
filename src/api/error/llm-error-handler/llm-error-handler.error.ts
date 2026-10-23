import OpenAI from "openai";
import { LLMError } from "../llm";
import { LLM_HTTP_ERRORS } from "../error.constant";

export function llmErrorHandler(error: unknown): LLMError {
  if (error instanceof LLMError) {
    return error;
  }

  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new LLMError(
      LLM_HTTP_ERRORS.LLM_TIMEOUT.code,
      LLM_HTTP_ERRORS.LLM_TIMEOUT.message,
      {
        cause: error,
      },
    );
  }

  if (error instanceof OpenAI.RateLimitError) {
    return new LLMError(
      LLM_HTTP_ERRORS.LLM_RATE_LIMIT.code,
      LLM_HTTP_ERRORS.LLM_RATE_LIMIT.message,
      {
        cause: error,
      },
    );
  }

  if (error instanceof OpenAI.AuthenticationError) {
    return new LLMError(
      LLM_HTTP_ERRORS.LLM_AUTHENTICATION_ERROR.code,
      LLM_HTTP_ERRORS.LLM_AUTHENTICATION_ERROR.message,
      { cause: error },
    );
  }

  return new LLMError(
    LLM_HTTP_ERRORS.LLM_PROVIDER_ERROR.code,
    LLM_HTTP_ERRORS.LLM_PROVIDER_ERROR.message,
    {
      cause: error,
    },
  );
}
