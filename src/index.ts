import { Elysia } from "elysia";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .get("/", () => {
    return {
      message: "Hello from ElysiaJS + Bun!",
      status: "success",
    };
  })
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  })
  .listen(port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
