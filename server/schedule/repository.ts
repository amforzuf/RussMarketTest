import { pool, transaction } from "../db";
import type {
  Bootstrap,
  Employee,
  Schedule,
  Shift,
  Template,
} from "../../shared/schedule";
import { ScheduleError } from "./errors";

type Metadata = Pick<Schedule, "version" | "publishedAt">;
export async function ensureSchedule(id: string) {
  await pool.query(
    "INSERT INTO schedules(id) VALUES ($1) ON CONFLICT DO NOTHING",
    [id],
  );
}
export async function readSchedule(id: string): Promise<Bootstrap> {
  return transaction(async (client) => {
    const meta = await client.query<Metadata>(
      'SELECT version, published_at AS "publishedAt" FROM schedules WHERE id=$1',
      [id],
    );
    const shifts = await client.query<Shift>(
      `
      SELECT employee_id AS "employeeId", to_char(date, 'YYYY-MM-DD') AS date,
        to_char(start_time, 'HH24:MI') AS start, to_char(end_time, 'HH24:MI') AS end, kind
      FROM shifts WHERE schedule_id=$1 ORDER BY employee_id, date`,
      [id],
    );
    const employees = await client.query<Employee>(
      "SELECT id, name, role FROM employees ORDER BY id",
    );
    const templates = await client.query<Template>(`
      SELECT id, name, to_char(start_time, 'HH24:MI') AS start, to_char(end_time, 'HH24:MI') AS end
      FROM templates ORDER BY position`);
    return {
      ...meta.rows[0],
      shifts: shifts.rows,
      employees: employees.rows,
      templates: templates.rows,
    };
  }, true);
}
export async function writeSchedule(
  id: string,
  version: number,
  shifts: Shift[],
  publish: boolean,
): Promise<Metadata> {
  return transaction(async (client) => {
    const result = await client.query<Metadata>(
      `
      UPDATE schedules SET version=version+1, updated_at=now(),
        published_at=CASE WHEN $3 THEN now() ELSE NULL END
      WHERE id=$1 AND version=$2 RETURNING version, published_at AS "publishedAt"`,
      [id, version, publish],
    );
    if (!result.rowCount)
      throw new ScheduleError(
        "conflict",
        "График изменён в другой вкладке. Обновите данные перед сохранением.",
      );
    const employees = await client.query<{ id: number }>(
      "SELECT id FROM employees",
    );
    const ids = new Set(employees.rows.map((employee) => employee.id));
    if (shifts.some((shift) => !ids.has(shift.employeeId)))
      throw new ScheduleError("employee_not_found", "Сотрудник не найден");
    await client.query("DELETE FROM shifts WHERE schedule_id=$1", [id]);
    if (shifts.length)
      await client.query(
        `
      INSERT INTO shifts(schedule_id, employee_id, date, start_time, end_time, kind)
      SELECT $1, x."employeeId", x.date::date, x.start::time, x.end::time, x.kind
      FROM jsonb_to_recordset($2::jsonb) AS x("employeeId" integer, date text, start text, "end" text, kind text)`,
        [id, JSON.stringify(shifts)],
      );
    return result.rows[0];
  });
}
