import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
export function SchedulesPage() {
  return (
    <>
      <header className="page-heading">
        <h1>Графики смен</h1>
      </header>
      <Link className="navigation-card" to="/schedules/current">
        <CalendarDays size={22} />
        <span>График</span>
        <ChevronRight size={18} />
      </Link>
    </>
  );
}
