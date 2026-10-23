import OpenAI from "openai";
import { LLMError } from "../llm";

export function llmErrorHandler(error: unknown): LLMError {
  if (error instanceof LLMError) {
    return error;
  }

  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new LLMError("LLM_TIMEOUT", "LLM provider request timed out", {
      cause: error,
    });
  }

  if (error instanceof OpenAI.RateLimitError) {
    return new LLMError("LLM_RATE_LIMIT", "LLM provider rate limit exceeded", {
      cause: error,
    });
  }

  if (error instanceof OpenAI.AuthenticationError) {
    return new LLMError(
      "LLM_AUTHENTICATION_ERROR",
      "LLM provider authentication failed",
      { cause: error },
    );
  }

  return new LLMError("LLM_PROVIDER_ERROR", "LLM provider request failed", {
    cause: error,
  });
}
