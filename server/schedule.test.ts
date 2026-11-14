import { saveSchema } from "./schedule/schema.js";
import test from "node:test";
import assert from "node:assert/strict";
import { duration, visibleDates, dateKey } from "../shared/schedule.js";

const shift = {
  employeeId: 1,
  date: "2026-11-14",
  start: "22:00",
  end: "06:00",
  kind: "custom",
};
test("Ночная смена длится восемь часов", () => {
  assert.equal(duration("22:00", "06:00"), 8);
  assert.equal(duration("09:00", "17:30"), 8.5);
  assert.ok(saveSchema.safeParse({ version: 0, shifts: [shift] }).success);
});
test("Неверные даты, время и дубликаты не проходят проверку", () => {
  for (const shifts of [
    [{ ...shift, date: "2026-02-30" }],
    [{ ...shift, start: "25:00" }],
    [{ ...shift, end: "22:00" }],
    [shift, shift],
  ]) {
    assert.equal(saveSchema.safeParse({ version: 0, shifts }).success, false);
  }
});
test("Неделя начинается с понедельника и пересекает границу года", () => {
  const days = visibleDates(new Date(2027, 0, 1), "week").map(dateKey);
  assert.equal(days[0], "2026-12-28");
  assert.equal(days[6], "2027-01-03");
});
test("Месяц учитывает високосный год", () => {
  assert.equal(visibleDates(new Date(2028, 1, 29), "month").length, 29);
  assert.equal(visibleDates(new Date(2027, 1, 28), "month").length, 28);
});
