import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";
import { cellKey, dateKey, visibleDates } from "../../../../shared/schedule";
import {
  assignShifts,
  moveShift,
  removeShifts,
  type ShiftValue,
} from "./editor";
import { fullDate, type CalendarView } from "./format";
import { useSchedule } from "./use-schedule";
import { useSelection } from "./use-selection";
import type { MenuPosition } from "./format";

export function useCalendar() {
  const schedule = useSchedule();
  const [anchor, setAnchor] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState<MenuPosition | null>(null);
  const [error, setError] = useState("");
  const dates = useMemo(() => visibleDates(anchor, view), [anchor, view]);
  const employees = useMemo(
    () =>
      schedule.data?.employees.filter((employee) =>
        employee.name
          .toLocaleLowerCase("ru")
          .includes(query.trim().toLocaleLowerCase("ru")),
      ) ?? [],
    [schedule.data, query],
  );
  const selection = useSelection(employees, dates);
  const closeMenu = useCallback(() => setMenu(null), []);
  function resetSelection() {
    selection.clear();
    closeMenu();
  }
  function openMenu(rect: DOMRect, title: string) {
    setMenu({
      x: Math.max(8, Math.min(rect.left, window.innerWidth - 260)),
      y: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 260)),
      title,
    });
  }
  function assign(value: ShiftValue) {
    if (schedule.saving || !selection.selected.size) return;
    if (!value.start || !value.end || value.start === value.end) {
      setError("Начало и конец смены должны различаться");
      return;
    }
    schedule.change(assignShifts(schedule.shifts, selection.selected, value));
    setError("");
    closeMenu();
  }
  function drop(event: DragEvent, target: string) {
    event.preventDefault();
    if (schedule.saving) return;
    try {
      const payload = JSON.parse(
        event.dataTransfer.getData("application/json"),
      );
      if (typeof payload.source === "string")
        schedule.change(moveShift(schedule.shifts, payload.source, target));
      else {
        const template = schedule.data?.templates.find(
          (item) => item.id === payload.template,
        );
        if (template)
          schedule.change(
            assignShifts(schedule.shifts, new Set([target]), {
              ...template,
              kind: template.id,
            }),
          );
      }
      resetSelection();
    } catch {
      setError("Не удалось перенести смену");
    }
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.closest("input, textarea, select") ||
          event.target.isContentEditable)
      )
        return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        schedule.undo();
        closeMenu();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        if (selection.selected.size) {
          event.preventDefault();
          schedule.change(removeShifts(schedule.shifts, selection.selected));
          resetSelection();
        }
      } else if (/^[1-3]$/.test(event.key) && selection.selected.size) {
        const template = schedule.data?.templates[Number(event.key) - 1];
        if (template) assign({ ...template, kind: template.id });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  return {
    ...schedule,
    dates,
    employees,
    view,
    query,
    menu,
    selected: selection.selected,
    error: error || schedule.error?.message,
    closeMenu,
    assign,
    drop,
    selectCell(event: MouseEvent<HTMLButtonElement>, row: number, col: number) {
      const wasSelected = selection.selected.has(
        cellKey(employees[row].id, dateKey(dates[col])),
      );
      selection.select(event, row, col);
      if (
        !wasSelected &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        selection.selected.size === 0
      ) {
        openMenu(
          event.currentTarget.getBoundingClientRect(),
          `${employees[row].name} · ${dates[col].getDate()}`,
        );
      } else closeMenu();
    },
    selectDate(event: MouseEvent<HTMLButtonElement>, date: Date) {
      selection.selectDate(date);
      openMenu(event.currentTarget.getBoundingClientRect(), fullDate(date));
    },
    remove() {
      schedule.change(removeShifts(schedule.shifts, selection.selected));
      resetSelection();
    },
    setQuery(value: string) {
      setQuery(value);
      resetSelection();
    },
    setView(value: CalendarView) {
      setView(value);
      resetSelection();
    },
    navigate(direction: number) {
      setAnchor((current) =>
        view === "month"
          ? new Date(current.getFullYear(), current.getMonth() + direction, 1)
          : new Date(
              current.getFullYear(),
              current.getMonth(),
              current.getDate() + direction * 7,
            ),
      );
      resetSelection();
    },
  };
}
