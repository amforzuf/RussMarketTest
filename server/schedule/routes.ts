import { Hono } from "hono";
import type { SessionEnv } from "../middleware/session.js";
import { readSchedule, writeSchedule } from "./repository.js";
import { saveSchema } from "./schema.js";

export const scheduleRoutes = new Hono<SessionEnv>();
scheduleRoutes.get("/", async (context) => {
  const schedule = await readSchedule(context.get("scheduleId"));
  context.header("Cache-Control", "no-store");
  return context.json(schedule);
});
scheduleRoutes.put("/", async (context) => {
  const parsed = saveSchema.safeParse(
    await context.req.json().catch(() => null),
  );
  if (!parsed.success)
    return context.json({ error: parsed.error.issues[0].message }, 400);
  const { version, shifts, publish } = parsed.data;
  return context.json(
    await writeSchedule(context.get("scheduleId"), version, shifts, publish),
  );
});
