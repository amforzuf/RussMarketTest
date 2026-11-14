import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id integer PRIMARY KEY,
      name text NOT NULL,
      role text NOT NULL DEFAULT 'агент'
    );
    CREATE TABLE IF NOT EXISTS templates (
      id text PRIMARY KEY,
      name text NOT NULL,
      start_time time NOT NULL,
      end_time time NOT NULL,
      position integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id uuid PRIMARY KEY,
      version integer NOT NULL DEFAULT 0,
      published_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS shifts (
      schedule_id uuid NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      employee_id integer NOT NULL REFERENCES employees(id),
      date date NOT NULL,
      start_time time NOT NULL,
      end_time time NOT NULL,
      kind text NOT NULL CHECK (kind IN ('morning', 'day', 'evening', 'custom')),
      PRIMARY KEY (schedule_id, employee_id, date),
      CHECK (start_time <> end_time)
    );
    INSERT INTO templates VALUES
      ('morning', 'Утро', '07:00', '15:00', 1),
      ('day', 'День', '10:00', '18:00', 2),
      ('evening', 'Вечер', '15:00', '23:00', 3)
    ON CONFLICT DO NOTHING;
  `);
  const names = [
    "Кузнецова Алина",
    "Волков Тимур",
    "Морозова Виктория",
    "Соколов Артём",
    "Лебедева Полина",
    "Новиков Кирилл",
    "Ерохина Дарья",
    "Гаврилов Егор",
  ];
  for (const [index, name] of names.entries()) {
    await client.query(
      "INSERT INTO employees(id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [index + 1, name],
    );
  }
  await client.query("COMMIT");
  console.log("База данных готова");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
