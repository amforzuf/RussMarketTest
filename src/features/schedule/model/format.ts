import { duration } from "../../../../shared/schedule";
export const hours = (start: string, end: string) =>
  `${duration(start, end).toLocaleString("ru-RU")} ч`;
export const fullDate = (date: Date) =>
  date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export type CalendarView = "week" | "month";
export type MenuPosition = { x: number; y: number; title: string };

export const shiftTime = (value: string) =>
  value.endsWith(":00") ? value.slice(0, 2) : value;

export const templateShortcuts: Record<string, string> = {
  morning: "1",
  day: "4",
  evening: "2",
};
