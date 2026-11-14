import { attachDatabasePool } from "@vercel/functions";
import { app } from "../server/app";
import { pool } from "../server/db";

attachDatabasePool(pool);

export default { fetch: app.fetch };
