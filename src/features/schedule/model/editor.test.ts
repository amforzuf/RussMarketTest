import test from "node:test";
import assert from "node:assert/strict";
import {
  assignShifts,
  editorReducer,
  initialEditorState,
  moveShift,
  sameShifts,
} from "./editor";
import type { Shift } from "../../../../shared/schedule";

const shift: Shift = {
  employeeId: 1,
  date: "2026-11-14",
  start: "09:00",
  end: "17:00",
  kind: "custom",
};
test("перенос заменяет целевую ячейку и не сохраняет координаты источника", () => {
  const target = { ...shift, employeeId: 2, start: "10:00" };
  assert.deepEqual(moveShift([shift, target], "1/2026-11-14", "2/2026-11-14"), [
    { ...shift, employeeId: 2 },
  ]);
  assert.equal(shift.employeeId, 1);
});
test("назначение группы заменяет смены, не мутируя исходные данные", () => {
  const result = assignShifts(
    [shift],
    new Set(["1/2026-11-14", "2/2026-11-14"]),
    { start: "22:00", end: "06:00", kind: "custom" },
  );
  assert.equal(result.length, 2);
  assert.equal(result[0].start, "22:00");
  assert.equal(shift.start, "09:00");
  assert.ok(sameShifts(result, [...result].reverse()));
});
test("отмена восстанавливает предыдущие смены, сброс удаляет историю", () => {
  const changed = editorReducer(initialEditorState, {
    type: "change",
    previous: [shift],
    next: [],
  });
  assert.deepEqual(editorReducer(changed, { type: "undo" }).draft, [shift]);
  assert.deepEqual(
    editorReducer(changed, { type: "reset" }),
    initialEditorState,
  );
});
