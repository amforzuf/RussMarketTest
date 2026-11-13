import { cellKey, type Shift } from "../../../../shared/schedule";

export type ShiftValue = Pick<Shift, "start" | "end" | "kind">;
export type EditorState = { draft: Shift[] | null; history: Shift[][] };
export type EditorAction =
  | { type: "change"; previous: Shift[]; next: Shift[] }
  | { type: "undo" }
  | { type: "reset" };
export const initialEditorState: EditorState = { draft: null, history: [] };

export function editorReducer(
  state: EditorState,
  action: EditorAction,
): EditorState {
  switch (action.type) {
    case "change":
      return {
        draft: action.next,
        history: [...state.history.slice(-29), action.previous],
      };
    case "undo":
      return state.history.length
        ? { draft: state.history.at(-1)!, history: state.history.slice(0, -1) }
        : state;
    case "reset":
      return initialEditorState;
  }
}

export function assignShifts(
  shifts: Shift[],
  keys: ReadonlySet<string>,
  value: ShiftValue,
): Shift[] {
  if (!keys.size) return shifts;
  const next = shifts.filter(
    (shift) => !keys.has(cellKey(shift.employeeId, shift.date)),
  );
  for (const key of keys) {
    const [employeeId, date] = key.split("/");
    next.push({
      employeeId: Number(employeeId),
      date,
      start: value.start,
      end: value.end,
      kind: value.kind,
    });
  }
  return next;
}

export function removeShifts(shifts: Shift[], keys: ReadonlySet<string>) {
  return shifts.filter(
    (shift) => !keys.has(cellKey(shift.employeeId, shift.date)),
  );
}

export function moveShift(shifts: Shift[], source: string, target: string) {
  const shift = shifts.find(
    (item) => cellKey(item.employeeId, item.date) === source,
  );
  return shift
    ? assignShifts(
        removeShifts(shifts, new Set([source])),
        new Set([target]),
        shift,
      )
    : shifts;
}

export function sameShifts(left: Shift[], right: Shift[]) {
  if (left.length !== right.length) return false;
  const indexed = new Map(
    left.map((shift) => [cellKey(shift.employeeId, shift.date), shift]),
  );
  return right.every((shift) => {
    const other = indexed.get(cellKey(shift.employeeId, shift.date));
    return (
      other?.start === shift.start &&
      other.end === shift.end &&
      other.kind === shift.kind
    );
  });
}
