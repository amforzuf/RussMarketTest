import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useCalendar } from "../features/schedule/model/use-calendar";
import { CalendarToolbar } from "../features/schedule/ui/CalendarToolbar";
import { CalendarTable } from "../features/schedule/ui/CalendarTable";
import { ShiftPanel } from "../features/schedule/ui/ShiftPanel";
import { ShiftMenu } from "../features/schedule/ui/ShiftMenu";

export function SchedulePage() {
  const calendar = useCalendar();
  return (
    <>
      <Link className="breadcrumb" to="/schedules">
        <span className="back-icon">
          <ChevronLeft size={16} />
        </span>
        Графики смен
      </Link>
      <header className="page-heading">
        <h1>График</h1>
        <div className="actions">
          <button
            className="secondary"
            disabled={
              !calendar.data || calendar.saving || !calendar.shifts.length
            }
            onClick={() => calendar.save(true)}
          >
            Опубликовать
          </button>
          <button
            className="primary"
            disabled={!calendar.data || calendar.saving || !calendar.dirty}
            onClick={() => calendar.save(false)}
            aria-busy={calendar.saving}
          >
            Сохранить
          </button>
        </div>
      </header>
      {calendar.error && (
        <div className="message error" role="alert">
          {calendar.error}
          <button
            onClick={() => {
              if (
                !calendar.dirty ||
                window.confirm(
                  "Загрузить сохранённый график? Локальные изменения будут потеряны.",
                )
              )
                void calendar.reload();
            }}
          >
            Обновить данные
          </button>
        </div>
      )}
      {calendar.loading && (
        <div className="loading" role="status" aria-label="Загрузка графика">
          <span className="spinner" />
        </div>
      )}
      {calendar.data && (
        <div className="workspace">
          <section className="calendar-panel" aria-label="График сотрудников">
            <CalendarToolbar
              query={calendar.query}
              view={calendar.view}
              dates={calendar.dates}
              onQuery={calendar.setQuery}
              onView={calendar.setView}
              onNavigate={calendar.navigate}
            />
            <CalendarTable
              dates={calendar.dates}
              employees={calendar.employees}
              shifts={calendar.shifts}
              selected={calendar.selected}
              view={calendar.view}
              disabled={calendar.saving}
              onCell={calendar.selectCell}
              onDate={calendar.selectDate}
              onDrop={calendar.drop}
              onDrag={calendar.closeMenu}
            />
          </section>
          <ShiftPanel
            templates={calendar.data.templates}
            hasSelection={calendar.selected.size > 0}
            saving={calendar.saving}
            onAssign={calendar.assign}
          />
        </div>
      )}
      {calendar.menu && calendar.data && !calendar.saving && (
        <ShiftMenu
          position={calendar.menu}
          templates={calendar.data.templates}
          onAssign={calendar.assign}
          onRemove={calendar.remove}
          onClose={calendar.closeMenu}
        />
      )}
    </>
  );
}
