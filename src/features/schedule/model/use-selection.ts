import { useRef, useState, type MouseEvent } from "react";
import { cellKey, dateKey, type Employee } from "../../../../shared/schedule";

export function useSelection(employees: Employee[], dates: Date[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const anchor = useRef<{ row: number; col: number } | null>(null);
  function select(event: MouseEvent, row: number, col: number) {
    const key = cellKey(employees[row].id, dateKey(dates[col]));
    if (event.shiftKey && anchor.current) {
      const range = new Set<string>();
      for (
        let r = Math.min(row, anchor.current.row);
        r <= Math.max(row, anchor.current.row);
        r++
      ) {
        for (
          let c = Math.min(col, anchor.current.col);
          c <= Math.max(col, anchor.current.col);
          c++
        ) {
          if (employees[r] && dates[c])
            range.add(cellKey(employees[r].id, dateKey(dates[c])));
        }
      }
      setSelected(range);
    } else {
      setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      anchor.current = { row, col };
    }
  }
  return {
    selected,
    select,
    selectDate(date: Date) {
      setSelected(
        new Set(
          employees.map((employee) => cellKey(employee.id, dateKey(date))),
        ),
      );
    },
    clear() {
      setSelected(new Set());
      anchor.current = null;
    },
  };
}
