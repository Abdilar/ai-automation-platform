import fastify from "fastify";
import { errorHandler, jobRoutes } from "./api";
import { registerRateLimit } from "./api/plugin";

export function buildApp() {
  const isProduction = process.env.NODE_ENV === "production";

  const app = fastify({
    logger: {
      level: isProduction ? "info" : "debug",
      redact: ['req.headers.x-api-key', 'req.headers.authorization']
    },
  });

  app.setErrorHandler(errorHandler)
  
  app.get("/api/v1/health", async () => ({
    status: "ok",
  }));

  app.register(async (protectedApp) => {
    await registerRateLimit(protectedApp)

    await protectedApp.register(jobRoutes, {prefix: '/api/v1/jobs'})
  })

  return app
}
