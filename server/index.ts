import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import { app } from "./app";
import { pool } from "./db";

app.get("/assets/*", serveStatic({ root: "./dist" }));
for (const path of ["/", "/schedules", "/schedules/current"]) {
  app.get(path, serveStatic({ path: "./dist/index.html" }));
}

const server = serve({
  fetch: app.fetch,
  port: Number(process.env.PORT || 3001),
  hostname: process.env.HOST || "127.0.0.1",
});
console.log(
  `Сервер: http://${process.env.HOST || "127.0.0.1"}:${process.env.PORT || 3001}`,
);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () =>
    server.close(() => {
      void pool.end().then(() => process.exit(0));
    }),
  );
}
