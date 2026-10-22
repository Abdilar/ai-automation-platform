import { FastifyInstance } from "fastify";
import { OpenAIProvider } from "../../infrastructure";
import { LLMJobDescriptionExtractor } from "../../application";
import { ExtractJobRequestSchema } from "../schema";
import { authenticateApiKey } from "../middleware";
import { AppError, HTTP_ERRORS } from "../error";

export async function jobRoutes(app: FastifyInstance): Promise<void> {
  const provider = new OpenAIProvider();
  const extractor = new LLMJobDescriptionExtractor(provider);

  app.addHook("onRequest", authenticateApiKey);

  app.post("/extract", async (request, reply) => {
    const parsed = ExtractJobRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(
        HTTP_ERRORS.VALIDATION_ERROR.statusCode,
        HTTP_ERRORS.VALIDATION_ERROR.code,
        HTTP_ERRORS.VALIDATION_ERROR.messageFa,
      );
    }

    try {
      const result = await extractor.extract(parsed.data.text);

      return reply.code(200).send({
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "Job extraction failed");

      throw new AppError(
        HTTP_ERRORS.LLM_PROVIDER_ERROR.statusCode,
        HTTP_ERRORS.LLM_PROVIDER_ERROR.code,
        HTTP_ERRORS.LLM_PROVIDER_ERROR.messageFa,
      );
    }
  });
}
