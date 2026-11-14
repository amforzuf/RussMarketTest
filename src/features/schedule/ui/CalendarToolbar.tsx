import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import type { CalendarView } from "../model/format";

type Props = {
  query: string;
  view: CalendarView;
  dates: Date[];
  onQuery: (value: string) => void;
  onView: (value: CalendarView) => void;
  onNavigate: (direction: number) => void;
};
export function CalendarToolbar({
  query,
  view,
  dates,
  onQuery,
  onView,
  onNavigate,
}: Props) {
  const period =
    view === "month"
      ? dates[0].toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
      : `${dates[0].getDate()} — ${dates.at(-1)!.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`;
  return (
    <>
      <div className="toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Поиск по ФИО"
            placeholder="Поиск по ФИО"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
          {query && (
            <button aria-label="Очистить поиск" onClick={() => onQuery("")}>
              <X size={14} />
            </button>
          )}
        </label>
        <div className="view-switch" aria-label="Вид календаря">
          {(["month", "week"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={view === value}
              className={view === value ? "chosen" : ""}
              onClick={() => onView(value)}
            >
              {value === "month" ? "Месяц" : "Неделя"}
            </button>
          ))}
        </div>
        <div className="period" title={period}>
          <button
            className="icon-button"
            aria-label="Предыдущий период"
            onClick={() => onNavigate(-1)}
          >
            <ChevronLeft size={17} />
          </button>

          <button
            className="icon-button"
            aria-label="Следующий период"
            onClick={() => onNavigate(1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
