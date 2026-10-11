import { FastifyInstance } from "fastify";
import { OpenAIProvider } from "../../infrastructure";
import { LLMJobDescriptionExtractor } from "../../application";
import { ExtractJobRequestSchema } from "../schema";

export async function jobRoutes(app: FastifyInstance): Promise<void> {
  const provider = new OpenAIProvider();
  const extractor = new LLMJobDescriptionExtractor(provider);

  app.post('/extract', async (request, reply) => {
    const parsed = ExtractJobRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: parsed.error.flatten()
        }
      })
    }

    const result = await extractor.extract(parsed.data.text)

    return reply.code(200).send({
      data: result
    })
  })
}
