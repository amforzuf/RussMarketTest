import { createMiddleware } from "hono/factory";
export const checkOrigin = createMiddleware(async (context, next) => {
  const origin = context.req.header("origin");
  if (
    context.req.method !== "GET" &&
    origin &&
    origin !== process.env.APP_ORIGIN &&
    origin !== new URL(context.req.url).origin
  ) {
    return context.json({ error: "Недопустимый источник запроса" }, 403);
  }
  await next();
});
