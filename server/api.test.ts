import test from "node:test";
import assert from "node:assert/strict";
import { app } from "./app.js";
import { pool } from "./db.js";

test(
  "API сохраняет смены, изолирует посетителей и защищает от конфликтов",
  { skip: !process.env.DATABASE_URL },
  async () => {
    const first = await app.request("/api/schedule");
    assert.equal(first.status, 200);
    const cookie = first.headers.get("set-cookie")!.split(";")[0];
    const initial = await first.json();
    const shifts = [
      {
        employeeId: initial.employees[0].id,
        date: "2026-11-14",
        start: "22:00",
        end: "06:00",
        kind: "custom",
      },
    ];
    const save = (body: unknown) =>
      app.request("/api/schedule", {
        method: "PUT",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    let otherId: string | undefined;
    try {
      const saved = await save({ version: 0, publish: true, shifts });
      assert.equal(saved.status, 200);
      assert.ok((await saved.json()).publishedAt);
      const loaded = await app.request("/api/schedule", {
        headers: { Cookie: cookie },
      });
      assert.deepEqual((await loaded.json()).shifts, shifts);
      assert.equal((await save({ version: 0, shifts: [] })).status, 409);
      assert.equal(
        (
          await save({
            version: 1,
            shifts: [{ ...shifts[0], employeeId: 99999 }],
          })
        ).status,
        400,
      );
      assert.equal(
        (await save({ version: 1, shifts: [shifts[0], shifts[0]] })).status,
        400,
      );
      const other = await app.request("/api/schedule");
      otherId = other.headers.get("set-cookie")!.split(";")[0].split("=")[1];
      assert.deepEqual((await other.json()).shifts, []);
      assert.equal((await save({ version: 1, shifts: [] })).status, 200);
      const deleted = await app.request("/api/schedule", {
        headers: { Cookie: cookie },
      });
      const empty = await deleted.json();
      assert.deepEqual(empty.shifts, []);
      assert.equal(empty.publishedAt, null);
      const invalid = await app.request("/api/schedule", {
        method: "PUT",
        headers: { Cookie: cookie },
        body: "{",
      });
      assert.equal(invalid.status, 400);
    } finally {
      await pool.query("DELETE FROM schedules WHERE id = ANY($1::uuid[])", [
        [cookie.split("=")[1], otherId].filter(Boolean),
      ]);
      await pool.end();
    }
  },
);
