import { useMemo, type DragEvent, type MouseEvent } from "react";
import { UserRound } from "lucide-react";
import {
  cellKey,
  dateKey,
  duration,
  type Employee,
  type Shift,
} from "../../../../shared/schedule";
import { fullDate, type CalendarView } from "../model/format";
import { ShiftCell } from "./ShiftCell";

type Props = {
  dates: Date[];
  employees: Employee[];
  shifts: Shift[];
  selected: ReadonlySet<string>;
  view: CalendarView;
  disabled: boolean;
  onCell: (
    event: MouseEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) => void;
  onDate: (event: MouseEvent<HTMLButtonElement>, date: Date) => void;
  onDrop: (event: DragEvent, key: string) => void;
  onDrag: () => void;
};
export function CalendarTable({
  dates,
  employees,
  shifts,
  selected,
  view,
  disabled,
  onCell,
  onDate,
  onDrop,
  onDrag,
}: Props) {
  const { indexed, coverage, totals } = useMemo(() => {
    const indexed = new Map<string, Shift>();
    const coverage = new Map<string, number>();
    const totals = new Map<number, number>();
    const visible = new Set(dates.map(dateKey));
    for (const shift of shifts) {
      indexed.set(cellKey(shift.employeeId, shift.date), shift);
      coverage.set(shift.date, (coverage.get(shift.date) ?? 0) + 1);
      if (visible.has(shift.date))
        totals.set(
          shift.employeeId,
          (totals.get(shift.employeeId) ?? 0) +
            duration(shift.start, shift.end),
        );
    }
    return { indexed, coverage, totals };
  }, [dates, shifts]);
  return (
    <div className={`table-scroll ${view}`}>
      <table>
        <thead>
          <tr>
            <th scope="col" className="employee-heading">
              Сотрудник
            </th>
            {dates.map((date) => (
              <th scope="col" key={dateKey(date)}>
                <button
                  disabled={disabled || !employees.length}
                  className={date.getDay() % 6 === 0 ? "weekend" : ""}
                  aria-label={`Назначить смены на ${fullDate(date)}`}
                  onClick={(event) => onDate(event, date)}
                >
                  <span>
                    {date.toLocaleDateString("ru", { weekday: "short" })}
                  </span>
                  <span>{date.getDate()}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, row) => (
            <tr key={employee.id}>
              <th scope="row" className="employee">
                <span className="avatar">
                  <UserRound size={22} strokeWidth={1} />
                </span>
                <span className="employee-info">
                  <span>{employee.name}</span>
                  <small>
                    {employee.role} ·{" "}
                    {(totals.get(employee.id) ?? 0).toLocaleString("ru-RU")} ч
                  </small>
                </span>
              </th>
              {dates.map((date, col) => {
                const key = cellKey(employee.id, dateKey(date));
                return (
                  <ShiftCell
                    key={key}
                    employee={employee}
                    date={date}
                    shift={indexed.get(key)}
                    selected={selected.has(key)}
                    disabled={disabled}
                    view={view}
                    onSelect={(event) => onCell(event, row, col)}
                    onDrop={onDrop}
                    onDrag={onDrag}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Покрытие</th>
            {dates.map((date) => {
              const count = coverage.get(dateKey(date)) ?? 0;
              return (
                <td
                  key={dateKey(date)}
                  className={count ? "covered" : "uncovered"}
                  title={`${fullDate(date)}: ${count} смен`}
                >
                  {count}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
