import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify';

export async function registerRateLimit(app: FastifyInstance) : Promise<void> {
  await app.register(rateLimit, {
    global: false,
    max: 200,
    timeWindow: '1 minute',
    keyGenerator: (request) => {
      return request.ip
    },
    errorResponseBuilder: (_request, context) => ({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(context.ttl / 1000),
      }
    })
  })
}