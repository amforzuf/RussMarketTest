export type Shift = {
  employeeId: number;
  date: string;
  start: string;
  end: string;
  kind: "morning" | "day" | "evening" | "custom";
};
export type Employee = { id: number; name: string; role: string };
export type Template = {
  id: Shift["kind"];
  name: string;
  start: string;
  end: string;
};
export type Schedule = {
  version: number;
  publishedAt: string | null;
  shifts: Shift[];
};
export type Bootstrap = Schedule & {
  employees: Employee[];
  templates: Template[];
};
export const cellKey = (employeeId: number, date: string) =>
  `${employeeId}/${date}`;
export function duration(start: string, end: string) {
  const minutes = (s: string) =>
    Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  return ((minutes(end) - minutes(start) + 1440) % 1440) / 60;
}
export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function visibleDates(anchor: Date, view: "week" | "month") {
  const start = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    view === "month" ? 1 : anchor.getDate(),
  );
  if (view === "week")
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const count =
    view === "week"
      ? 7
      : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  return Array.from(
    { length: count },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}
