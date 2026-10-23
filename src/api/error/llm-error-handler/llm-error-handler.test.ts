import Fastify from "fastify";
import { LLM_HTTP_ERRORS } from "../error.constant";
import { errorHandler } from "../error-handler";
import { LLMError } from "../llm/llm.error";
import { expect, test } from "vitest";

const cases = [
  [
    LLM_HTTP_ERRORS.LLM_RATE_LIMIT.code,
    LLM_HTTP_ERRORS.LLM_RATE_LIMIT.statusCode,
  ],
  [LLM_HTTP_ERRORS.LLM_TIMEOUT.code, LLM_HTTP_ERRORS.LLM_TIMEOUT.statusCode],
  [
    LLM_HTTP_ERRORS.LLM_AUTHENTICATION_ERROR.code,
    LLM_HTTP_ERRORS.LLM_AUTHENTICATION_ERROR.statusCode,
  ],
  [
    LLM_HTTP_ERRORS.LLM_INVALID_RESPONSE.code,
    LLM_HTTP_ERRORS.LLM_INVALID_RESPONSE.statusCode,
  ],
  [
    LLM_HTTP_ERRORS.LLM_PROVIDER_ERROR.code,
    LLM_HTTP_ERRORS.LLM_PROVIDER_ERROR.statusCode,
  ],
] as const;

for (const [code, expectedStatus] of cases) {
  test(`handle ${code}`, async () => {
    const app = Fastify();

    app.setErrorHandler(errorHandler);

    app.get("/test", async () => {
      throw new LLMError(code, "Internal provider details");
    });

    try {
      const response = await app.inject({ method: "GET", url: "/test" });
      expect(response.statusCode).toBe(expectedStatus);
      expect(response.json().error.code).toBe(code);
      expect(response.body).not.toContain("Internal provider details");
    } finally {
      await app.close();
    }
  });
}
