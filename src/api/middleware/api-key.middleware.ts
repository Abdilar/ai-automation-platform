import { timingSafeEqual } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";

function isValidApiKey(receivedKey: string, expectedKey: string): boolean {
  const receivedKeyBuffer = Buffer.from(receivedKey, "utf-8");
  const expectedKeyBuffer = Buffer.from(expectedKey, "utf-8");

  if (receivedKeyBuffer.length !== expectedKeyBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedKeyBuffer, expectedKeyBuffer);
}

export async function authenticateApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const expectedKey = process.env.AI_AUTOMATION_PLATFORM_API_KEY;

  if (!expectedKey) {
    return reply.code(503).send({
      error: {
        code: "AUTH_NOT_CONFIGURED",
        message: "Authentication is unavailable",
      },
    });
  }

  const receivedKey = request.headers['x-api-key']

  if (typeof receivedKey !== 'string' || !isValidApiKey(receivedKey, expectedKey)) {
    return reply.code(401).send({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or missing API key"
      }
    })
  }
}
