import { Plus } from "lucide-react";
import type { DragEvent, MouseEvent } from "react";
import {
  cellKey,
  dateKey,
  type Employee,
  type Shift,
} from "../../../../shared/schedule";
import { fullDate, hours, type CalendarView } from "../model/format";

type Props = {
  employee: Employee;
  date: Date;
  shift?: Shift;
  selected: boolean;
  disabled: boolean;
  view: CalendarView;
  onSelect: (event: MouseEvent<HTMLButtonElement>) => void;
  onDrop: (event: DragEvent, key: string) => void;
  onDrag: () => void;
};
export function ShiftCell({
  employee,
  date,
  shift,
  selected,
  disabled,
  view,
  onSelect,
  onDrop,
  onDrag,
}: Props) {
  const key = cellKey(employee.id, dateKey(date));
  return (
    <td>
      <button
        disabled={disabled}
        className={`cell ${shift?.kind ?? "empty"} ${selected ? "selected" : ""}`}
        aria-pressed={selected}
        aria-label={`${employee.name}, ${fullDate(date)}: ${shift ? `${shift.start}–${shift.end}` : "нет смены"}`}
        title={
          shift
            ? `${shift.start}–${shift.end}, ${hours(shift.start, shift.end)}`
            : "Назначить смену"
        }
        onClick={onSelect}
        draggable={!!shift && !disabled}
        onDragStart={(event) => {
          event.dataTransfer.setData(
            "application/json",
            JSON.stringify({ source: key }),
          );
          event.dataTransfer.effectAllowed = "move";
          onDrag();
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => onDrop(event, key)}
      >
        {shift ? (
          <>
            <strong>{hours(shift.start, shift.end)}</strong>
            {view === "week" && (
              <small>
                {shift.start} – {shift.end}
              </small>
            )}
          </>
        ) : selected ? (
          <Plus size={18} />
        ) : null}
      </button>
    </td>
  );
}
