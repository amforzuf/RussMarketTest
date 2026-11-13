import { randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";
import { getCookie, setCookie } from "hono/cookie";
import { ensureSchedule } from "../schedule/repository";

export type SessionEnv = { Variables: { scheduleId: string } };
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const scheduleSession = createMiddleware<SessionEnv>(
  async (context, next) => {
    let id = getCookie(context, "schedule");
    if (!id || !uuidPattern.test(id)) {
      id = randomUUID();
      setCookie(context, "schedule", id, {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
      });
    }
    await ensureSchedule(id);
    context.set("scheduleId", id);
    await next();
  },
);
