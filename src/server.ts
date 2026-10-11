import "dotenv/config";
import { buildApp } from "./app";

async function main(): Promise<void> {
  const app = buildApp();

  try {
    await app.listen({
      host: process.env.HOST ?? "127.0.0.1",
      port: Number(process.env.PORT ?? 3000),
    });
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

void main()