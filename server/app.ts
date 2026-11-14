import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { scheduleSession, type SessionEnv } from "./middleware/session.js";
import { checkOrigin } from "./middleware/origin.js";
import { scheduleRoutes } from "./schedule/routes.js";
import { ScheduleError } from "./schedule/errors.js";

export const app = new Hono<SessionEnv>();
app.use("*", secureHeaders());
app.use("/api/*", bodyLimit({ maxSize: 3 * 1024 * 1024 }));
app.use("/api/*", checkOrigin);
app.use("/api/schedule", scheduleSession);
app.route("/api/schedule", scheduleRoutes);
app.notFound((context) => context.json({ error: "Не найдено" }, 404));
app.onError((error, context) => {
  if (error instanceof ScheduleError)
    return context.json(
      { error: error.message },
      error.code === "conflict" ? 409 : 400,
    );
  console.error(error);
  return context.json(
    { error: "Не удалось выполнить запрос. Попробуйте ещё раз." },
    500,
  );
});
