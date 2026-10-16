import { FastifyInstance } from "fastify";
import { OpenAIProvider } from "../../infrastructure";
import { LLMJobDescriptionExtractor } from "../../application";
import { ExtractJobRequestSchema } from "../schema";
import { authenticateApiKey } from "../middleware";
import { AppError, ERROR_STATUS } from "../error";
import { STATUS_CODES } from "node:http";

export async function jobRoutes(app: FastifyInstance): Promise<void> {
  const provider = new OpenAIProvider();
  const extractor = new LLMJobDescriptionExtractor(provider);

  app.addHook("onRequest", authenticateApiKey);

  app.post("/extract", async (request, reply) => {
    const parsed = ExtractJobRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new AppError(
        ERROR_STATUS.VALIDATION_ERROR.STATUS_CODE,
        ERROR_STATUS.VALIDATION_ERROR.CODE,
        ERROR_STATUS.VALIDATION_ERROR.MESSAGE_FA,
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
        ERROR_STATUS.LLM_PROVIDER_ERROR.STATUS_CODE,
        ERROR_STATUS.LLM_PROVIDER_ERROR.CODE,
        ERROR_STATUS.LLM_PROVIDER_ERROR.MESSAGE_FA,
      );
    }
  });
}
